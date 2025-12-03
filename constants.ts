import { Product } from './types';

import protocoloDesinflamacionImg from '@assets/crie+uma+i (1)_1764195608015.png';
import registroEvolucionImg from '@assets/Screenshot_82_1764195648912.png';
import planAnticelulitisImg from '@assets/Fisioponto_tratamentos_Massagem_anticelulite_Bodyslim_1764195790548.png';
import quemaGrasaDuermesImg from '@assets/Screenshot_83_1764195842878.png';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Gelatina Reductora',
    category: 'Receta',
    image: '/gelatina-reductora.png',
    isLocked: false,
    description: 'Una poderosa aliada para el adelgazamiento, rica en colágeno y propiedades diuréticas.',
    duration: 'PREP: 15min',
    lessons: 0, // Não é um curso
    recipeDetails: {
      ingredients: [
        "1 sobre (≈12 g) de gelatina incolora y sin sabor",
        "200 ml de té verde muy concentrado",
        "1 cucharada sopera de chía hidratada (hidratar en 40 ml de agua por 10 min)",
        "1 cucharada de jengibre fresco rallado (o 1 cucharadita colmada de jengibre en polvo)",
        "Jugo de ½ limón (opcional, mejora el sabor)",
        "Endulzante a gusto (opcional)"
      ],
      preparation: [
        { title: "Preparar el té verde súper concentrado", step: "En 200 ml de agua caliente (sin hervir), infusionar 3 saquitos de té verde (o 2 cucharadas de té suelto) por 1 minuto. Colar y mantener caliente." },
        { title: "Hidratar la chía", step: "Mezclar 1 cucharada sopera de chía con 40 ml de agua; dejar reposar ~10 minutos hasta formar gel." },
        { title: "Hidratar la gelatina", step: "Colocar la gelatina en 50 ml de agua fría y dejar reposar 5 minutos." },
        { title: "Disolver la gelatina", step: "Verter el té verde caliente sobre la gelatina hidratada y mezclar hasta disolver completamente." },
        { title: "Agregar el jengibre", step: "Añadir el jengibre rallado mientras la mezcla esté tibia para liberar más compuestos activos." },
        { title: "Ajustar sabor", step: "Agregar el jugo de limón y el endulzante si se desea." },
        { title: "Incorporar la chía", step: "Cuando la mezcla esté tibia (no caliente), añadir la chía hidratada y mezclar bien." },
        { title: "Refrigerar", step: "Verter en un recipiente y llevar a la refrigeradora por 2–3 horas hasta que solidifique." },
        { title: "Consumir", step: "Tomar 30 minutos antes de la comida principal." }
      ],
      usage: [
        { title: "Cuándo tomar", content: "30 minutos antes del almuerzo o la cena." },
        { title: "Cantidad recomendada", content: "1 porción." }
      ],
      tips: [
        "Si el té queda amargo, reducir el tiempo de infusión a 30–45 segundos.",
        "Si se desea una textura más firme, reducir el agua del té en 10–20 ml.",
        "Si queda una capa acuosa arriba, mezclar antes de consumir.",
        "Versión sin cafeína: usar té verde descafeinado o reemplazar por té de hibisco (cambia el efecto).",
        "Para una versión más dulce sin calorías, usar stevia o eritritol."
      ],
      variants: [
        "Suave: 1 saquito de té verde + 1 cucharadita de chía.",
        "Ultra (solo para tolerantes a cafeína): reemplazar parte del té por ½ cucharadita de matcha.",
        "Vegana: usar agar-agar en lugar de gelatina (la textura será más firme).",
        "Con colágeno: añadir 1 cucharada de colágeno hidrolizado cuando la mezcla esté tibia."
      ],
      warnings: [
        "Contiene cafeína (té verde). Evitar si se es muy sensible, si hay hipertensión no controlada o si un médico lo indicó.",
        "El jengibre puede causar acidez en algunas personas; reducir la dosis si ocurre."
      ]
    }
  },
  {
    id: 'p2',
    title: 'Desinflamación de 7 días',
    category: 'Protocolo',
    image: protocoloDesinflamacionImg,
    isLocked: false,
    description: 'Un protocolo intensivo de una semana para deshinchar, eliminar toxinas, recuperar el equilibrio metabólico y preparar el cuerpo para el truco de la gelatina reductora.',
    duration: '7 Días',
    lessons: 7,
    protocolDetails: [
      {
        day: 1,
        title: "Drenaje Inicial",
        focus: "eliminar líquidos y deshinchar desde el primer día.",
        tricks: [
          "500 ml de agua tibia con limón repartidos por la mañana.",
          "Beber 2.5 litros de agua durante el día.",
          "Reducir la sal al mínimo.",
          "Auto-drenaje linfático (2–3 min en abdomen y piernas).",
          "1 taza de té de hibisco o cola de caballo por la tarde."
        ]
      },
      {
        day: 2,
        title: "Inflamación Cero",
        focus: "reducir inflamación leve con compuestos naturales.",
        tricks: [
          "Shot antiinflamatorio: jengibre + cúrcuma + pimienta negra + limón (1 vez).",
          "Añadir cúrcuma en alguna comida (¼ cucharadita).",
          "Bebidas calientes: té verde o té de jengibre.",
          "10 minutos de respiración profunda para bajar cortisol.",
          "Caminata ligera de 20–30 minutos."
        ]
      },
      {
        day: 3,
        title: "Intestino en Calma",
        focus: "digestión ligera, menos gases y abdomen relajado.",
        tricks: [
          "1 cucharada de chía hidratada (gel) por la mañana.",
          "Té de menta después de una comida. Priorizar alimentos frescos y crudos durante el día.",
          "Evitar lácteos y gluten hoy.",
          "5 minutos de estiramientos suaves del abdomen."
        ]
      },
      {
        day: 4,
        title: "Flujo Activo",
        focus: "activar el sistema linfático de forma constante.",
        tricks: [
          "1 litro de té de cola de caballo o hibisco durante el día.",
          "Caminata suave de 30 minutos.",
          "Elevar las piernas por 5 minutos antes de dormir.",
          "Agua tibia con limón al despertar.",
          "Cero alimentos muy salados."
        ]
      },
      {
        day: 5,
        title: "Hígado Ligero",
        focus: "apoyar al hígado para reducir inflamación interna.",
        tricks: [
          "Té de diente de león o boldo (mañana o después del almuerzo).",
          "Hoy: cero alcohol, cero frituras, cero azúcar.",
          "Añadir limón en alguna comida.",
          "2 litros de agua + 300 ml de agua de coco.",
          "Baño caliente terminando con agua fría en las piernas (contrastes)."
        ]
      },
      {
        day: 6,
        title: "Ritmo Metabólico",
        focus: "estabilizar glucosa e insulina para bajar inflamación.",
        tricks: [
          "1 cucharada de vinagre de manzana diluida en agua antes de una comida.",
          "Añadir canela en alguna fruta o bebida del día.",
          "Evitar completamente harinas refinadas.",
          "Té verde entre comidas.",
          "No comer 2–3 horas antes de dormir."
        ]
      },
      {
        day: 7,
        title: "Cuerpo en Equilibrio",
        focus: "descanso digestivo y desinflamación final.",
        tricks: [
          "1 litro de té de jengibre durante el día.",
          "Agua tibia con limón al despertar.",
          "Priorizar comidas suaves (no obligatorio).",
          "Actividad relajante: respiración, estiramientos o caminata leve.",
          "Evitar pantallas 1 hora antes de dormir."
        ]
      }
    ]
  },
  {
    id: 'p3',
    title: 'Registro de Evolución',
    category: 'Seguimiento',
    image: registroEvolucionImg,
    isLocked: false,
    description: 'Acompaña tu progreso, registra tu peso y celebra cada conquista en tu viaje de transformación.',
    trackerDetails: true
  }
];

export const BONUSES: Product[] = [
  {
    id: 'b1',
    title: 'Reset Hormonal',
    category: 'Menopausia',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop',
    isLocked: false,
    description: 'Hábitos, infusiones y ajustes simples para equilibrar hormonas, reducir hinchazón y mejorar energía.',
    duration: 'Guía',
    guideDetails: [
      {
        title: "Introducción",
        blocks: [
          { type: 'text', content: "La menopausia no es el fin de tu vitalidad. Con pequeños ajustes en la alimentación y estilo de vida, es posible reducir los sofocos, la hinchazón abdominal y recuperar tu energía natural." }
        ]
      },
      {
        title: "Infusiones Aliadas",
        blocks: [
          { type: 'subtitle', title: "Salvia para los Sofocos" },
          { type: 'recipe_card', title: "Té de Salvia y Limón", content: "1 cucharada de hojas de salvia secas + 250ml de agua. Infusionar 5 min. Tomar frío o caliente, 2 veces al día." },
          { type: 'subtitle', title: "Trébol Rojo para el Equilibrio" },
          { type: 'text', content: "Rico en isoflavonas, ayuda a imitar suavemente el estrógeno en el cuerpo. Tomar 1 taza al día por la mañana." },
          { type: 'subtitle', title: "Té de Maca Peruana" },
          { type: 'recipe_card', title: "Maca Energy", content: "1 cdita de maca en polvo disuelta en 200ml de agua caliente o leche vegetal. Ayuda con la libido y energía." }
        ]
      },
      {
        title: "Hábitos Clave",
        blocks: [
          { type: 'list', items: [
            "Reduce el café: La cafeína puede disparar los sofocos.",
            "Cena ligero: Evita carbohidratos pesados por la noche para mejorar el sueño.",
            "Semillas de Lino: Consume 1 cucharada molida al día para apoyo hormonal.",
            "Magnesio antes de dormir: Ayuda a relajar los músculos y mejora el descanso."
          ]}
        ]
      }
    ]
  },
  {
    id: 'b2',
    title: 'Detox 3 Días',
    category: 'Post-Excesos',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop',
    isLocked: false,
    description: 'Un plan exprés para desinflamar y limpiar el cuerpo después de fines de semana, fiestas o comidas pesadas.',
    duration: 'Protocolo',
    guideDetails: [
      {
        title: "Estrategia General",
        blocks: [
          { type: 'text', content: "Este no es un plan de hambre, sino de limpieza. Eliminaremos alimentos inflamatorios (azúcar, harina, lácteos) y aumentaremos la hidratación y fibra." },
          { type: 'warning', title: "Regla de Oro", content: "Bebe al menos 3 litros de líquido al día (agua, tés, caldos) durante estos 3 días." }
        ]
      },
      {
        title: "Día 1: Drenaje",
        blocks: [
          { type: 'list', items: [
            "Ayuno de 12 horas (cena a las 20h, desayuno a las 8h).",
            "Desayuno: Batido verde (espinaca, pepino, manzana verde, limón).",
            "Almuerzo: Ensalada gigante con pollo a la plancha o pescado.",
            "Cena: Sopa de verduras depurativa (apio, cebolla, calabacín)."
          ]}
        ]
      },
      {
        title: "Día 2: Restauración",
        blocks: [
          { type: 'text', content: "Introducimos grasas saludables y probióticos." },
          { type: 'list', items: [
            "Desayuno: Huevos revueltos con espinacas.",
            "Merienda: Puñado de nueces o almendras.",
            "Cena: Crema de calabaza con jengibre (sin crema de leche)."
          ]}
        ]
      },
      {
        title: "Día 3: Activación",
        blocks: [
          { type: 'tip', title: "Movimiento", content: "Añade 20 minutos de caminata rápida hoy para reactivar el metabolismo." },
          { type: 'recipe_card', title: "Caldo Depurativo", content: "Hervir: 2L agua, 2 ramas apio, 1 cebolla, 1 manojo perejil. Colar y beber el líquido durante el día." }
        ]
      }
    ]
  },
  {
    id: 'b3',
    title: '20 Tés Adelgazantes',
    category: 'Infusiones',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1936&auto=format&fit=crop',
    isLocked: false,
    description: 'Selección premium de 20 infusiones naturales para acelerar el metabolismo, drenar líquidos y reducir inflamación.',
    duration: 'Guía',
    guideDetails: [
      {
        title: "1. Tés Termogénicos (Aceleran Metabolismo)",
        blocks: [
          { type: 'recipe_card', title: "Té Verde con Jengibre", content: "1 saquito de té verde + 1 cm de jengibre. Infusionar 3 min. Tomar antes de entrenar." },
          { type: 'recipe_card', title: "Té de Canela y Clavo", content: "1 rama de canela + 3 clavos en 250ml agua hirviendo. Reposar 10 min. Reduce el azúcar en sangre." },
          { type: 'recipe_card', title: "Té Oolong (Azul)", content: "2g de té oolong en agua a 90°C por 3 min. Oxida grasas eficientemente." },
          { type: 'recipe_card', title: "Té Matcha", content: "1/2 cdita matcha en 60ml agua caliente. Batir hasta espumar. Completar con agua. Antioxidante potente." },
          { type: 'recipe_card', title: "Té de Pimienta Cayena", content: "Agua tibia, jugo de medio limón y una pizca de cayena. Activa la termogénesis." },
          { type: 'recipe_card', title: "Té Negro con Limón", content: "Té negro cargado con rodajas de limón. Energizante matutino sustituto del café." }
        ]
      },
      {
        title: "2. Tés Diuréticos (Deshinchan)",
        blocks: [
          { type: 'recipe_card', title: "Cola de Caballo", content: "1 cda de hierba seca en 250ml agua hirviendo. Reposar 5 min. Potente drenante." },
          { type: 'recipe_card', title: "Té de Hibisco", content: "1 cda de flores secas en agua caliente. Reposar 5 min. Baja la presión y deshincha." },
          { type: 'recipe_card', title: "Pelo de Elote (Maíz)", content: "Hervir un puñado de pelo de elote en 500ml agua por 10 min. Limpia vías urinarias." },
          { type: 'recipe_card', title: "Diente de León", content: "1 cda de raíz o hojas secas. Infusionar 10 min. Apoyo hepático y renal." },
          { type: 'recipe_card', title: "Té de Perejil", content: "1 rama fresca en agua hirviendo. Reposar 15 min. Elimina retención severa." },
          { type: 'recipe_card', title: "Té de Piña", content: "Hervir cáscaras de piña lavadas con canela por 20 min. Colar y beber frío o caliente." },
          { type: 'recipe_card', title: "Té de Alcachofa", content: "Hervir hojas de alcachofa 15 min. Sabor amargo, excelente para el hígado graso." }
        ]
      },
      {
        title: "3. Tés Digestivos y Relax (Vientre Plano)",
        blocks: [
          { type: 'recipe_card', title: "Menta Piperita", content: "Hojas frescas o secas infusionadas 5 min. Elimina gases instantáneamente." },
          { type: 'recipe_card', title: "Hinojo", content: "1 cdita de semillas machacadas. Infusionar 5 min. Reduce hinchazón abdominal." },
          { type: 'recipe_card', title: "Manzanilla y Anís", content: "Mezcla clásica para relajar el estómago después de comidas pesadas." },
          { type: 'recipe_card', title: "Té de Melisa", content: "Relaja el sistema nervioso y digestivo. Ideal para el estrés que causa hinchazón." },
          { type: 'recipe_card', title: "Té de Rooibos", content: "Sin teína, dulce natural. Rico en minerales y digestivo." },
          { type: 'recipe_card', title: "Té de Jengibre y Limón", content: "Rodajas de jengibre hervidas 5 min + jugo de limón. Antiinflamatorio digestivo." },
          { type: 'recipe_card', title: "Té de Cúrcuma (Golden Tea)", content: "1/2 cdita cúrcuma + pimienta negra + leche vegetal. Antiinflamatorio potente." }
        ]
      }
    ]
  },
  {
    id: 'b4',
    title: '15 Jugos Detox',
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?q=80&w=1974&auto=format&fit=crop',
    isLocked: false,
    description: '15 combinaciones poderosas para deshinchar en 24 horas y mejorar la digestión y energía.',
    duration: 'Recetas',
    guideDetails: [
      {
        title: "Jugos Verdes (Oxigenación y Limpieza)",
        blocks: [
          { type: 'recipe_card', title: "1. El Clásico Glow", content: "1 pepino + 1 manzana verde + 1 tallo apio + limón + jengibre. Licuar con agua." },
          { type: 'recipe_card', title: "2. Súper Alcalino", content: "2 tazas espinaca + 1/2 pepino + perejil + 1 limón. Base de agua." },
          { type: 'recipe_card', title: "3. Detox Intestinal", content: "1 hoja aloe vera (gel) + 1/2 papaya + 1 naranja. Licuar bien." },
          { type: 'recipe_card', title: "4. Adiós Retención", content: "2 ramas apio + 1 manojo perejil + 1/2 piña + agua. Potente diurético." },
          { type: 'recipe_card', title: "5. Energía Pura", content: "1 manzana verde + 1 kiwi + 1 puñado espinaca + agua de coco." }
        ]
      },
      {
        title: "Jugos Rojos y Naranjas (Piel y Circulación)",
        blocks: [
          { type: 'recipe_card', title: "6. Bomba Vitamina C", content: "2 zanahorias + 1 naranja + 1/2 cdita cúrcuma. Antiinflamatorio." },
          { type: 'recipe_card', title: "7. Circulación Total", content: "1 remolacha pequeña + 1 zanahoria + 1 manzana + limón. Mejora flujo sanguíneo." },
          { type: 'recipe_card', title: "8. Piel Radiante", content: "2 zanahorias + 1/2 pimiento rojo + 1 naranja. Rico en betacarotenos." },
          { type: 'recipe_card', title: "9. Antioxidante Berry", content: "1 taza frutos rojos + 1/2 remolacha + agua de coco." },
          { type: 'recipe_card', title: "10. Anti-Inflamatorio Dulce", content: "1 rodaja piña + 1 trozo cúrcuma raíz + 1 zanahoria." }
        ]
      },
      {
        title: "Jugos Especiales y Shots Largos",
        blocks: [
          { type: 'recipe_card', title: "11. Hidratación Extrema", content: "1 pepino + 1 rodaja sandía + menta. Súper refrescante." },
          { type: 'recipe_card', title: "12. Digestión de Hierro", content: "1/2 piña + 1 cm jengibre + 1 cdita semillas hinojo (infusionadas previamente)." },
          { type: 'recipe_card', title: "13. Inmunidad Plus", content: "2 kiwis + 1 naranja + 1 limón + 1 cdita miel." },
          { type: 'recipe_card', title: "14. Metal Pesado Detox", content: "1 manojo cilantro + 1 manzana verde + 1 limón + agua." },
          { type: 'recipe_card', title: "15. Relax Nocturno", content: "1 hoja lechuga + 1 manzana + té de manzanilla frío como base." }
        ]
      }
    ]
  },
  {
    id: 'b5',
    title: '10 Shots Turbo',
    category: 'Rutina',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1926&auto=format&fit=crop',
    isLocked: false,
    description: '10 Shots rápidos y potentes con jengibre, cúrcuma, limón y más para activar el cuerpo desde temprano.',
    duration: '5 min/día',
    guideDetails: [
      {
        title: "Shots para la Mañana (Ayunas)",
        blocks: [
          { type: 'recipe_card', title: "1. Despertar Picante", content: "Jugo 1 limón + Pizca pimienta cayena + 1 cdita miel." },
          { type: 'recipe_card', title: "2. Anti-Inflamación Oro", content: "Jugo 1 naranja + 1 cdita cúrcuma polvo + Pizca pimienta negra + 1 cdita aceite oliva." },
          { type: 'recipe_card', title: "3. Digestión Total", content: "Jugo 1 limón + 1 cdita vinagre manzana + 20ml agua tibia." },
          { type: 'recipe_card', title: "4. Inmunidad Verde", content: "Jugo jengibre (exprímelo) + Jugo limón + Pizca sal marina." },
          { type: 'recipe_card', title: "5. Energy Boost", content: "Jugo pomelo + 1/2 cdita Guaraná o Matcha." }
        ]
      },
      {
        title: "Shots Específicos",
        blocks: [
          { type: 'recipe_card', title: "6. Adiós Resfriado", content: "1 diente ajo machacado + limón + miel. (Tragar rápido)." },
          { type: 'recipe_card', title: "7. Piel Limpia", content: "2 cdas Aloe Vera jugo + limón + clorofila líquida." },
          { type: 'recipe_card', title: "8. Post-Comida Pesada", content: "2 cdas vinagre manzana + agua con gas + limón." },
          { type: 'recipe_card', title: "9. Recuperación Muscular", content: "Jugo de cereza concentrado (tart cherry) o remolacha concentrada." },
          { type: 'recipe_card', title: "10. Alcalinizante", content: "Jugo de pasto de trigo (wheatgrass) o espirulina en agua con limón." }
        ]
      }
    ]
  },
  {
    id: 'b6',
    title: '15 Postres Fit',
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1935&auto=format&fit=crop',
    isLocked: false,
    description: '15 Dulces deliciosos, bajos en calorías y con ingredientes inteligentes para controlar ansiedad por azúcar.',
    duration: 'Recetario',
    guideDetails: [
      {
        title: "Chocolatosos",
        blocks: [
          { type: 'recipe_card', title: "1. Mousse de Aguacate", content: "Licuar 1 aguacate + 3 cdas cacao + estevia + chorrito leche vegetal. Enfriar." },
          { type: 'recipe_card', title: "2. Trufas de Energía", content: "Procesar 1 taza dátiles + 1/2 taza nueces + 2 cdas cacao. Formar bolitas." },
          { type: 'recipe_card', title: "3. Brownie Express", content: "1 huevo + 1 banana + 2 cdas cacao + 1 cdita polvo hornear. Microondas 2 min." },
          { type: 'recipe_card', title: "4. Chocolate Caliente Fit", content: "Leche almendras + 1 cda cacao + canela + estevia. Calentar sin hervir." },
          { type: 'recipe_card', title: "5. Bark de Yogurt", content: "Extender yogurt griego en bandeja, agregar chips chocolate 70% y fresas. Congelar." }
        ]
      },
      {
        title: "Frutales y Frescos",
        blocks: [
          { type: 'recipe_card', title: "6. Helado de 1 Ingrediente", content: "Congelar bananas en rodajas. Procesar hasta cremosidad. Opcional: canela." },
          { type: 'recipe_card', title: "7. Gelatina de Yogurt", content: "Mezclar yogurt griego con semillas chía y vainilla. Reposar noche. Top con berries." },
          { type: 'recipe_card', title: "8. Manzanas Asadas", content: "Hornear manzanas con canela y nueces por 20 min. Servir con yogurt." },
          { type: 'recipe_card', title: "9. Brochetas de Fruta", content: "Uvas y fresas bañadas en chocolate 70% derretido. Enfriar." },
          { type: 'recipe_card', title: "10. Sorbet de Mango", content: "Procesar mango congelado con jugo de limón y menta." }
        ]
      },
      {
        title: "Horneados y Otros",
        blocks: [
          { type: 'recipe_card', title: "11. Cookies de Avena", content: "1 banana + 1 taza avena + pasas. Mezclar, formar galletas, hornear 15 min." },
          { type: 'recipe_card', title: "12. Mugcake de Zanahoria", content: "1 huevo + 2 cdas harina avena + zanahoria rallada + canela. Microondas 90 seg." },
          { type: 'recipe_card', title: "13. Panqueques de Banana", content: "2 huevos + 1 banana pisada. Mezclar y cocinar en sartén." },
          { type: 'recipe_card', title: "14. 'Cheesecake' en Vaso", content: "Base de nueces molidas + Capa de yogurt con limón y estevia + Capa de mermelada s/azúcar." },
          { type: 'recipe_card', title: "15. Bolitas de Coco", content: "Clara de huevo + coco rallado + estevia. Hornear hasta dorar." }
        ]
      }
    ]
  },
  {
    id: 'b7',
    title: 'Plan Anticelulitis',
    category: 'Estética',
    image: planAnticelulitisImg,
    isLocked: false,
    description: 'Estrategia de drenaje natural, alimentos clave y técnicas anti-inflamación para reducir visiblemente la celulitis.',
    duration: '1 Semana',
    guideDetails: [
      {
        title: "Los 3 Pilares",
        blocks: [
          { type: 'text', content: "La celulitis es inflamación y retención. Para atacarla necesitamos: 1) Dieta Limpia, 2) Hidratación, 3) Estimulación Local." }
        ]
      },
      {
        title: "Alimentación Estratégica",
        blocks: [
          { type: 'warning', title: "Enemigos #1", content: "Sal, azúcar refinada, alcohol y harinas blancas. Empeoran visiblemente la piel de naranja." },
          { type: 'list', items: [
            "Consume Potasio: Plátano, aguacate, agua de coco (ayuda a eliminar sodio).",
            "Frutos Rojos: Antioxidantes que mejoran la circulación.",
            "Proteína de calidad: Necesaria para el colágeno y firmeza."
          ]}
        ]
      },
      {
        title: "Técnicas Externas",
        blocks: [
          { type: 'subtitle', title: "Cepillado en Seco" },
          { type: 'text', content: "Antes de ducharte, cepilla la piel en movimientos ascendentes desde los tobillos hacia el corazón. 5 minutos diarios hacen maravillas." },
          { type: 'subtitle', title: "Duchas de Contraste" },
          { type: 'text', content: "Alterna agua caliente y fría en las piernas al final del baño para activar la circulación sanguínea." },
          { type: 'recipe_card', title: "Exfoliante de Café", content: "Mezcla borra de café con aceite de coco. Masajea fuerte en zonas afectadas 2 veces por semana." }
        ]
      }
    ]
  }
];

export const LOCKED_CONTENT: Product[] = [
  {
    id: 'l1',
    title: 'Acelerador 14 Días',
    category: 'Protocolo Avanzado',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop',
    isLocked: true,
    description: 'Acompañamiento personalizado con nutricionistas.',
  },
  {
    id: 'l2',
    title: 'Quema-Grasa Mientras Duermes',
    category: 'Fórmula Nocturna',
    image: quemaGrasaDuermesImg,
    isLocked: true,
    description: 'Descuentos exclusivos en socios.',
  }
];

export const MOTIVATIONAL_QUOTES: string[] = [
  "El cuerpo logra lo que la mente cree.",
  "Pequeños progresos suman grandes resultados.",
  "No te rindas con lo que más quieres en la vida.",
  "Si fuera fácil, todo el mundo lo haría.",
  "Tu salud es tu mayor inversión.",
  "Cada entrenamiento cuenta, cada comida importa.",
  "Enfócate en el proceso, no solo en el resultado.",
  "Sé más fuerte que tu mejor excusa.",
  "Disciplina es libertad.",
  "Eres capaz de cosas increíbles.",
  "El dolor de hoy es la fuerza de mañana.",
  "Cuida tu cuerpo, es el único lugar que tienes para vivir.",
  "No se trata de tener tiempo, se trata de priorizar.",
  "El éxito comienza fuera de tu zona de confort.",
  "La motivación es lo que te hace empezar. El hábito es lo que te mantiene.",
  "Sé tu mejor versión todos los días.",
  "Créelo: estás más cerca que ayer.",
  "Comer bien es una forma de autorrespeto.",
  "No disminuyas la meta, aumenta el esfuerzo.",
  "El único entrenamiento malo es el que no sucedió.",
  "Las excusas no queman calorías.",
  "Tu futuro es creado por lo que haces hoy.",
  "Suda ahora, brilla después.",
  "La constancia es la clave para la transformación.",
  "Enamórate de cuidar de ti mismo.",
  "No necesitas ser perfecto, solo constante.",
  "El viaje de mil millas comienza con un paso.",
  "Supera tus límites, un día a la vez.",
  "Siéntete orgulloso de cada elección saludable.",
  "El esfuerzo de hoy es el cuerpo de mañana.",
  "Nutre tu cuerpo, él te lo agradecerá.",
  "No pares hasta estar orgulloso.",
  "El cambio duele, pero el estancamiento duele más.",
  "Sé obstinado con tus objetivos.",
  "Todo parece imposible hasta que se hace.",
  "Eres el proyecto más importante de tu vida.",
  "Respira profundo y continúa.",
  "Un hábito saludable a la vez.",
  "Celebra cada pequeña victoria.",
  "No te compares, inspírate.",
  "El secreto es no rendirse.",
  "La salud es la verdadera riqueza.",
  "Cambia tus hábitos, cambia tu vida.",
  "Sé agradecido por lo que tu cuerpo hace por ti.",
  "El equilibrio es el secreto del éxito.",
  "Entrena para ser fuerte, no solo delgado.",
  "Tu determinación define tu destino.",
  "Hazlo por ti, no por los otros.",
  "Empieza donde estás, usa lo que tienes.",
  "Lo imposible es solo una opinión.",
  "Despierta con determinación, duerme con satisfacción.",
  "La alimentación es el combustible de la vida.",
  "Sé paciente contigo mismo.",
  "Cada día es una nueva oportunidad.",
  "Desafíate a ser mejor que ayer.",
  "Ama el proceso y los resultados vendrán.",
  "Vive ligero, vive feliz.",
  "Tu energía te presenta antes de hablar.",
  "Invierte en ti, rinde los mejores intereses.",
  "¡Vamos juntos en esta jornada de transformación!"
];

