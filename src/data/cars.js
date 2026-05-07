const photo = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

// Curated demo images by exact or very close brand/model. Query pattern used:
// `${brand} ${model}`, `${brand} ${model} ${year}`, then `${brand} ${model} ${version}` only when useful.
const CAR_IMAGES = {
  'vw-amarok-2022': [
    'https://upload.wikimedia.org/wikipedia/commons/3/3a/2021_Volkswagen_Amarok_Extreme.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/ec/Volkswagen_V6_Amarok%2C_Pferdeanh%C3%A4nger%2C_Polizeipalast%2C_2022_Budapest.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/bd/Volkswagen_Amarok_%28Jamaica%29.jpg',
  ],
  'toyota-hilux-2021': [
    'https://upload.wikimedia.org/wikipedia/commons/8/81/Toyota_HiLux_GR_Sport_1X7A7281.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/ec/A_Toyota_Hilux_pickup_truck_with_a_snowplow_01.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/53/A_Toyota_Hilux_pickup_truck_with_a_snowplow_02.jpg',
  ],
  'ford-ranger-2020': [
    'https://upload.wikimedia.org/wikipedia/commons/c/c1/2020_Ford_Ranger_Wildtrak_second_facelift_front.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/16/2020_Ford_Ranger_Wildtrak_second_facelift_rear.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/de/2020_Ford_Ranger_Raptor_Front.jpg',
  ],
  'vw-golf-2019': [
    'https://upload.wikimedia.org/wikipedia/commons/0/0b/2019_Volkswagen_Golf_VII.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/92/2019_Volkswagen_Golf_VII_-2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b1/2019_Volkswagen_Golf_GTI_TCR_BS_O24.jpg',
  ],
  'toyota-corolla-2023': [
    'https://upload.wikimedia.org/wikipedia/commons/6/67/2023_Toyota_Corolla_Touring_Sports_Hybrid_%28E210%29_IMG_7679.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/58/2023_Toyota_Corolla_Touring_Sports_Hybrid_%28E210%29_IMG_8123.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/3f/Toyota_Corolla_Cross_Hybrid_1X7A6284.jpg',
  ],
  'peugeot-208-2022': [
    'https://upload.wikimedia.org/wikipedia/commons/b/b0/Peugeot_208_%282022%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/ce/Peugeot_208_1.6_Active_2022.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/78/2022_Peugeot_208_1.6_Active.jpg',
  ],
  'renault-duster-2021': [
    'https://upload.wikimedia.org/wikipedia/commons/6/69/Renault_Duster_Tandil.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/bf/Renault_Duster_2020_%28Russia%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/9f/Renault_Duster_%2851658579574%29.jpg',
  ],
  'fiat-cronos-2023': [
    'https://upload.wikimedia.org/wikipedia/commons/d/da/2023_Fiat_Cronos_1.3_Drive_%28Argentina%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f7/Fiat_Cronos_1.3_GSE_Like_2023_-_1-2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/ff/Fiat_Cronos_1.3_GSE_Like_2023_-_2-2.jpg',
  ],
  'chevrolet-tracker-2022': [
    'https://upload.wikimedia.org/wikipedia/commons/6/66/2022_Chevrolet_Tracker_1.2_Turbo_LTZ%2C_front_%28Argentina%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1d/2022_Chevrolet_Tracker_1.2_Turbo_LTZ%2C_rear_%28Argentina%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/33/2022_Chevrolet_Tracker_1.2_Turbo_LS.jpg',
  ],
  'nissan-frontier-2021': [
    'https://upload.wikimedia.org/wikipedia/commons/6/65/2021_Nissan_NP300_Frontier_Crew_Cab.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/8b/2021_Nissan_Frontier_Pro_4X_%28Colombia%3B_facelift%29_rear_view.png',
    'https://upload.wikimedia.org/wikipedia/commons/b/b0/2021_Nissan_Frontier_Buenos_Aires_City_Police_truck.jpg',
  ],
  'vw-tcross-2022': [
    'https://upload.wikimedia.org/wikipedia/commons/7/7d/Volkswagen_T-Cross_CN_Shishi_01_2022-03-13.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/76/Volkswagen_T-Cross_CN_Shishi_02_2022-03-13.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/eb/Volkswagen_T-Cross_1X7A0363.jpg',
  ],
  'ford-ecosport-2020': [
    'https://upload.wikimedia.org/wikipedia/commons/6/60/Ford_EcoSport_1.0T_Titanium_%282020%29_%2852720616241%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/91/18-20_Ford_EcoSport_SE_AWD_03-26-2020_Rear.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/7f/2018_Ford_EcoSport_SE_4WD%2C_Front_Right%2C_09-25-2020.jpg',
  ],
  'fiat-toro-2021': [
    'https://upload.wikimedia.org/wikipedia/commons/9/9c/2022_Fiat_Toro_2.0_Multijet_Volcano.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1c/2020_Fiat_Toro_Ultra.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/84/Fiat_Toro_Volcano_front.jpg',
  ],
  'toyota-yaris-2022': [
    'https://upload.wikimedia.org/wikipedia/commons/d/d8/Toyota_Yaris_Hybrid_GR_Sport_%28XP210%29_Automesse_Ludwigsburg_2022_1X7A5891.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/fa/Toyota_Yaris_Hybrid_GR_Sport_%28XP210%29_Automesse_Ludwigsburg_2022_1X7A5892.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/36/Toyota_GR_Yaris_RZ_1X7A0252.jpg',
  ],
  'chevrolet-cruze-2020': [
    'https://upload.wikimedia.org/wikipedia/commons/7/71/2020_Chevrolet_Cruze_1.4T_Premier_AT_%28front%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e4/2020_Chevrolet_Cruze_1.4T_Premier_AT_%28rear%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d7/Chevrolet_Cruze_LTZ_2020_de_Carburando_%282%29.jpg',
  ],
  'peugeot-3008-2021': [
    'https://upload.wikimedia.org/wikipedia/commons/6/67/2021_Peugeot_3008_B_1X7A0344.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/58/2021_Peugeot_3008_B_Hybrid4_1X7A0141.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/09/2021_Peugeot_3008_B_1X7A6965.jpg',
  ],
  'renault-kangoo-2022': [
    'https://upload.wikimedia.org/wikipedia/commons/7/71/Renault_Kangoo_III_Automesse_Ludwigsburg_2022_1X7A5952.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c9/Renault_Kangoo_III_Rapid_E-Tech_1X7A6132.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/Renault_Kangoo_III_Rapid_E-Tech_1X7A6133.jpg',
  ],
  'ford-fiesta-2018': [
    'https://upload.wikimedia.org/wikipedia/commons/5/5c/Ford_Fiesta_2018.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1b/Ford_Fiesta_2018_S_Plus_1.6_in_Montevideo_%28front%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/88/2018_Ford_Fiesta_SE_hatchback%2C_front_right%2C_09-28-2024.jpg',
  ],
};

export const CARS = [
  {
    id: 'vw-amarok-2022',
    brand: 'Volkswagen', model: 'Amarok', version: 'Highline 2.0 TDI 4x4 AT',
    year: 2022, km: 38000, price: 42500000, currency: 'ARS',
    fuel: 'Diésel', trans: 'Automática', engine: '2.0 TDI 180cv', color: 'Gris Indio',
    type: 'Camioneta', body: 'Pick-up doble cabina',
    badges: ['destacado', 'financia', 'permuta'],
    desc: 'Amarok Highline 4x4 con caja automática. Service oficial al día, único dueño, no fumador. Cubiertas nuevas, lona marítima y barra antivuelco.',
    photos: ['photo-1632245889029-e406faaa34cd','photo-1597007030739-6d2e7172ee2e','photo-1606016159991-dfe4f2746ad5','photo-1565043666747-69f6646db940'],
  },
  {
    id: 'toyota-hilux-2021',
    brand: 'Toyota', model: 'Hilux', version: 'SRX 2.8 TDI 4x4 AT',
    year: 2021, km: 62000, price: 48900000, currency: 'ARS',
    fuel: 'Diésel', trans: 'Automática', engine: '2.8 TDI 204cv', color: 'Blanco Perla',
    type: 'Camioneta', body: 'Pick-up doble cabina',
    badges: ['destacado', 'financia'],
    desc: 'Hilux SRX en estado impecable. Tapizado de cuero, GPS, cámara de retroceso. Listo para transferir.',
    photos: ['photo-1568844293986-8d0400bd4745','photo-1605559424843-9e4c228bf1c2','photo-1612825173281-9a193378527e','photo-1606016159991-dfe4f2746ad5'],
  },
  {
    id: 'ford-ranger-2020',
    brand: 'Ford', model: 'Ranger', version: 'Limited 3.2 TDCi 4x4 AT',
    year: 2020, km: 78000, price: 39800000, currency: 'ARS',
    fuel: 'Diésel', trans: 'Automática', engine: '3.2 TDCi 200cv', color: 'Negro Absoluto',
    type: 'Camioneta', body: 'Pick-up doble cabina',
    badges: ['permuta'],
    desc: 'Ranger Limited tope de gama. Cuero, techo corredizo, sensor de estacionamiento. Permuta menor valor.',
    photos: ['photo-1605893477799-b99e3b8b93fe','photo-1568844293986-8d0400bd4745','photo-1606016159991-dfe4f2746ad5','photo-1612825173281-9a193378527e'],
  },
  {
    id: 'vw-golf-2019',
    brand: 'Volkswagen', model: 'Golf', version: 'Comfortline 1.4 TSI DSG',
    year: 2019, km: 54000, price: 24500000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Automática', engine: '1.4 TSI 150cv', color: 'Gris Plata',
    type: 'Auto', body: 'Hatchback',
    badges: ['destacado', 'financia'],
    desc: 'Golf Comfortline TSI con caja DSG. Climatizador bizona, llantas 17", servicios sellados en concesionario.',
    photos: ['photo-1606664515524-ed2f786a0bd6','photo-1583121274602-3e2820c69888','photo-1503376780353-7e6692767b70','photo-1542362567-b07e54358753'],
  },
  {
    id: 'toyota-corolla-2023',
    brand: 'Toyota', model: 'Corolla', version: 'XEI 2.0 CVT',
    year: 2023, km: 18000, price: 28900000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Automática', engine: '2.0 170cv', color: 'Gris Oscuro',
    type: 'Auto', body: 'Sedán',
    badges: ['nuevo', 'financia', 'permuta'],
    desc: 'Corolla XEI casi 0km. Garantía oficial vigente. Pantalla 9", cargador inalámbrico, 7 airbags.',
    photos: ['photo-1623869675781-80aa31012a5a','photo-1621135802920-133df287f89c','photo-1503376780353-7e6692767b70','photo-1606664515524-ed2f786a0bd6'],
  },
  {
    id: 'peugeot-208-2022',
    brand: 'Peugeot', model: '208', version: 'Allure 1.6 Tiptronic',
    year: 2022, km: 31000, price: 19800000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Automática', engine: '1.6 115cv', color: 'Rojo Rubí',
    type: 'Auto', body: 'Hatchback',
    badges: ['financia'],
    desc: 'Peugeot 208 Allure caja Tiptronic. i-Cockpit, climatizador, llantas de aleación.',
    photos: ['photo-1502877338535-766e1452684a','photo-1583121274602-3e2820c69888','photo-1542362567-b07e54358753','photo-1503376780353-7e6692767b70'],
  },
  {
    id: 'renault-duster-2021',
    brand: 'Renault', model: 'Duster', version: 'Iconic 1.3 Turbo CVT',
    year: 2021, km: 47000, price: 22500000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Automática', engine: '1.3 TCe 156cv', color: 'Marrón Cobre',
    type: 'SUV', body: 'SUV compacta',
    badges: ['destacado', 'permuta'],
    desc: 'Duster Iconic, tope de gama. Tapizado mixto, GPS integrado, cámara 360°. Excelente estado.',
    photos: ['photo-1669212143408-8ddca1c01c1c','photo-1606664515524-ed2f786a0bd6','photo-1583121274602-3e2820c69888','photo-1503376780353-7e6692767b70'],
  },
  {
    id: 'fiat-cronos-2023',
    brand: 'Fiat', model: 'Cronos', version: 'Drive 1.3 GSE Pack Conectividad',
    year: 2023, km: 12000, price: 15900000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Manual', engine: '1.3 99cv', color: 'Blanco Banchisa',
    type: 'Auto', body: 'Sedán',
    badges: ['nuevo', 'financia'],
    desc: 'Cronos Drive con pack conectividad. Pantalla 7", Android Auto / Apple CarPlay, sensores de estacionamiento.',
    photos: ['photo-1583121274602-3e2820c69888','photo-1606664515524-ed2f786a0bd6','photo-1503376780353-7e6692767b70','photo-1542362567-b07e54358753'],
  },
  {
    id: 'chevrolet-tracker-2022',
    brand: 'Chevrolet', model: 'Tracker', version: 'Premier 1.2 Turbo AT',
    year: 2022, km: 28000, price: 26800000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Automática', engine: '1.2 Turbo 132cv', color: 'Azul Mediterráneo',
    type: 'SUV', body: 'SUV compacta',
    badges: ['destacado', 'financia', 'permuta'],
    desc: 'Tracker Premier, full equipo. Pantalla 8", techo panorámico, asientos calefaccionados.',
    photos: ['photo-1669212143408-8ddca1c01c1c','photo-1606664515524-ed2f786a0bd6','photo-1583121274602-3e2820c69888','photo-1542362567-b07e54358753'],
  },
  {
    id: 'nissan-frontier-2021',
    brand: 'Nissan', model: 'Frontier', version: 'LE 2.3 Bi-Turbo 4x4 AT',
    year: 2021, km: 56000, price: 41500000, currency: 'ARS',
    fuel: 'Diésel', trans: 'Automática', engine: '2.3 Bi-Turbo 190cv', color: 'Gris Grafito',
    type: 'Camioneta', body: 'Pick-up doble cabina',
    badges: ['financia', 'permuta'],
    desc: 'Frontier LE 4x4 automática. Cuero, GPS, cámara de retroceso, control de descenso.',
    photos: ['photo-1605893477799-b99e3b8b93fe','photo-1568844293986-8d0400bd4745','photo-1606016159991-dfe4f2746ad5','photo-1612825173281-9a193378527e'],
  },
  {
    id: 'vw-tcross-2022',
    brand: 'Volkswagen', model: 'T-Cross', version: 'Highline 1.4 TSI AT',
    year: 2022, km: 35000, price: 29900000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Automática', engine: '1.4 TSI 150cv', color: 'Blanco Cristal',
    type: 'SUV', body: 'SUV compacta',
    badges: ['destacado', 'financia'],
    desc: 'T-Cross Highline impecable. Tablero digital, climatizador, cámara, sensores delanteros y traseros.',
    photos: ['photo-1669212143408-8ddca1c01c1c','photo-1606664515524-ed2f786a0bd6','photo-1583121274602-3e2820c69888','photo-1542362567-b07e54358753'],
  },
  {
    id: 'ford-ecosport-2020',
    brand: 'Ford', model: 'EcoSport', version: 'Titanium 1.5 AT',
    year: 2020, km: 68000, price: 18900000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Automática', engine: '1.5 123cv', color: 'Azul Profundo',
    type: 'SUV', body: 'SUV compacta',
    badges: ['permuta'],
    desc: 'EcoSport Titanium con caja automática. Cuero, sensor de lluvia, llantas de aleación.',
    photos: ['photo-1669212143408-8ddca1c01c1c','photo-1583121274602-3e2820c69888','photo-1542362567-b07e54358753','photo-1503376780353-7e6692767b70'],
  },
  {
    id: 'fiat-toro-2021',
    brand: 'Fiat', model: 'Toro', version: 'Volcano 2.0 TDI 4x4 AT',
    year: 2021, km: 51000, price: 33500000, currency: 'ARS',
    fuel: 'Diésel', trans: 'Automática', engine: '2.0 TDI 170cv', color: 'Gris Vesubio',
    type: 'Camioneta', body: 'Pick-up doble cabina',
    badges: ['destacado', 'permuta'],
    desc: 'Toro Volcano 4x4. Cuero, climatizador bizona, control de crucero adaptativo.',
    photos: ['photo-1605893477799-b99e3b8b93fe','photo-1568844293986-8d0400bd4745','photo-1606016159991-dfe4f2746ad5','photo-1612825173281-9a193378527e'],
  },
  {
    id: 'toyota-yaris-2022',
    brand: 'Toyota', model: 'Yaris', version: 'XLS 1.5 CVT',
    year: 2022, km: 26000, price: 19500000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Automática', engine: '1.5 107cv', color: 'Plata Metálico',
    type: 'Auto', body: 'Hatchback',
    badges: ['financia'],
    desc: 'Yaris XLS CVT, único dueño. 7 airbags, control de estabilidad, cámara y sensores.',
    photos: ['photo-1623869675781-80aa31012a5a','photo-1583121274602-3e2820c69888','photo-1503376780353-7e6692767b70','photo-1542362567-b07e54358753'],
  },
  {
    id: 'chevrolet-cruze-2020',
    brand: 'Chevrolet', model: 'Cruze', version: 'LTZ 1.4 Turbo AT',
    year: 2020, km: 72000, price: 21800000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Automática', engine: '1.4 Turbo 153cv', color: 'Negro Carbón',
    type: 'Auto', body: 'Sedán',
    badges: ['permuta'],
    desc: 'Cruze LTZ tope de gama. Cuero, sunroof, llantas 17", MyLink con CarPlay.',
    photos: ['photo-1502877338535-766e1452684a','photo-1583121274602-3e2820c69888','photo-1542362567-b07e54358753','photo-1503376780353-7e6692767b70'],
  },
  {
    id: 'peugeot-3008-2021',
    brand: 'Peugeot', model: '3008', version: 'GT Line 1.6 THP AT',
    year: 2021, km: 44000, price: 36900000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Automática', engine: '1.6 THP 165cv', color: 'Gris Artense',
    type: 'SUV', body: 'SUV mediana',
    badges: ['destacado', 'financia', 'permuta'],
    desc: '3008 GT Line full. Tablero i-Cockpit 3D, techo panorámico, asientos AGR con masaje.',
    photos: ['photo-1669212143408-8ddca1c01c1c','photo-1606664515524-ed2f786a0bd6','photo-1583121274602-3e2820c69888','photo-1542362567-b07e54358753'],
  },
  {
    id: 'renault-kangoo-2022',
    brand: 'Renault', model: 'Kangoo', version: 'Express Confort 1.6 SCe',
    year: 2022, km: 42000, price: 17500000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Manual', engine: '1.6 SCe 115cv', color: 'Blanco Glaciar',
    type: 'Utilitario', body: 'Furgón',
    badges: ['financia'],
    desc: 'Kangoo Express Confort. Ideal para reparto. Bajo consumo, dirección asistida, ABS.',
    photos: ['photo-1597007030739-6d2e7172ee2e','photo-1605559424843-9e4c228bf1c2','photo-1568844293986-8d0400bd4745','photo-1612825173281-9a193378527e'],
  },
  {
    id: 'ford-fiesta-2018',
    brand: 'Ford', model: 'Fiesta', version: 'SE 1.6 Plus MT',
    year: 2018, km: 89000, price: 13500000, currency: 'ARS',
    fuel: 'Nafta', trans: 'Manual', engine: '1.6 123cv', color: 'Blanco Oxford',
    type: 'Auto', body: 'Hatchback',
    badges: ['nuevo'],
    desc: 'Fiesta SE Plus, recién ingresado. Service al día, motor original. Excelente primer auto.',
    photos: ['photo-1502877338535-766e1452684a','photo-1583121274602-3e2820c69888','photo-1503376780353-7e6692767b70','photo-1606664515524-ed2f786a0bd6'],
  },
];

CARS.forEach(car => {
  const curatedImages = CAR_IMAGES[car.id];
  car.images = curatedImages || car.photos.map(p => photo(p));
  car.photoUrls = car.images;
  car.thumbUrl = car.images[0] || '/logo-autostandil.png';
});

export const BRANDS = [...new Set(CARS.map(c => c.brand))].sort();
export const TYPES = ['Auto', 'Camioneta', 'SUV', 'Utilitario'];
export const FUELS = ['Nafta', 'Diésel'];
export const TRANSMISSIONS = ['Manual', 'Automática'];
export const BADGE_LABELS = {
  destacado: 'Destacado',
  financia: 'Financiación',
  permuta: 'Permuta',
  nuevo: 'Nuevo ingreso',
};
