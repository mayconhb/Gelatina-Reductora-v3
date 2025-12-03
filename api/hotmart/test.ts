export default function handler(req: any, res: any) {
  res.status(200).json({ 
    message: 'Hotmart webhook test OK',
    method: req.method,
    body: req.body,
    headers: {
      hottok: req.headers['x-hotmart-hottok'] || 'not provided'
    }
  });
}
