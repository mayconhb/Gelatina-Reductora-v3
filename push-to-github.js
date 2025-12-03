import { Octokit } from '@octokit/rest'
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function pushToGitHub() {
  try {
    const octokit = await getUncachableGitHubClient();
    
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);
    
    const repoName = 'gelatina-reductora-app';
    const owner = user.login;
    
    let isEmpty = false;
    
    try {
      await octokit.repos.get({ owner, repo: repoName });
      
      try {
        await octokit.git.getRef({ owner, repo: repoName, ref: 'heads/main' });
        console.log(`Repository ${repoName} exists with commits`);
      } catch (e) {
        isEmpty = true;
        console.log(`Repository ${repoName} exists but is empty`);
      }
    } catch (e) {
      console.log(`Repository ${repoName} does not exist, creating...`);
      await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'App Gelatina Reductora - Protocolo de emagrecimento',
        private: false,
        auto_init: false
      });
      isEmpty = true;
    }
    
    const filesToUpload = [];
    const ignoreDirs = ['node_modules', '.git', '.cache', '.config', '.upm', 'tmp'];
    const ignoreFiles = ['.replit', 'replit.nix', 'push-to-github.js'];
    
    function walkDir(dir, baseDir = '') {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const relativePath = path.join(baseDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!ignoreDirs.includes(file) && !file.startsWith('.')) {
            walkDir(filePath, relativePath);
          }
        } else {
          if (!ignoreFiles.includes(file) && !file.startsWith('.')) {
            filesToUpload.push(relativePath);
          }
        }
      }
    }
    
    walkDir('.');
    
    console.log(`Uploading ${filesToUpload.length} files...`);
    
    if (isEmpty) {
      const treeItems = [];
      
      for (const file of filesToUpload) {
        const content = fs.readFileSync(file);
        const isText = !file.match(/\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i);
        
        treeItems.push({
          path: file,
          mode: '100644',
          type: 'blob',
          content: isText ? content.toString('utf-8') : content.toString('base64')
        });
        
        process.stdout.write('.');
      }
      
      console.log('\nCreating tree for empty repo...');
      
      const { data: tree } = await octokit.git.createTree({
        owner,
        repo: repoName,
        tree: treeItems
      });
      
      console.log('Creating initial commit...');
      const { data: newCommit } = await octokit.git.createCommit({
        owner,
        repo: repoName,
        message: 'Initial commit - App Gelatina Reductora',
        tree: tree.sha,
        parents: []
      });
      
      console.log('Creating main branch...');
      await octokit.git.createRef({
        owner,
        repo: repoName,
        ref: 'refs/heads/main',
        sha: newCommit.sha
      });
    } else {
      const { data: ref } = await octokit.git.getRef({
        owner,
        repo: repoName,
        ref: 'heads/main'
      });
      const latestCommitSha = ref.object.sha;
      
      const { data: commit } = await octokit.git.getCommit({
        owner,
        repo: repoName,
        commit_sha: latestCommitSha
      });
      const treeSha = commit.tree.sha;
      
      const blobs = [];
      for (const file of filesToUpload) {
        const content = fs.readFileSync(file);
        const isText = !file.match(/\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i);
        
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo: repoName,
          content: content.toString(isText ? 'utf-8' : 'base64'),
          encoding: isText ? 'utf-8' : 'base64'
        });
        
        blobs.push({
          path: file,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });
        
        process.stdout.write('.');
      }
      console.log('\nCreating tree...');
      
      const { data: tree } = await octokit.git.createTree({
        owner,
        repo: repoName,
        tree: blobs,
        base_tree: treeSha
      });
      
      console.log('Creating commit...');
      const { data: newCommit } = await octokit.git.createCommit({
        owner,
        repo: repoName,
        message: 'Update from Replit - ' + new Date().toISOString(),
        tree: tree.sha,
        parents: [latestCommitSha]
      });
      
      console.log('Updating reference...');
      await octokit.git.updateRef({
        owner,
        repo: repoName,
        ref: 'heads/main',
        sha: newCommit.sha
      });
    }
    
    console.log(`\n✅ Success! Repository: https://github.com/${owner}/${repoName}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

pushToGitHub();
