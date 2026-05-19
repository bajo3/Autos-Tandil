export const VEHICLE_USE_OPTIONS = [
  { id: 'city', label: 'Ciudad', types: ['Auto', 'SUV'] },
  { id: 'family', label: 'Familia', types: ['SUV', 'Auto'] },
  { id: 'work', label: 'Trabajo', types: ['Camioneta', 'Utilitario'] },
  { id: 'road', label: 'Ruta', types: ['SUV', 'Camioneta', 'Auto'] },
];

export const VEHICLE_USE_LABELS = Object.fromEntries(VEHICLE_USE_OPTIONS.map(item => [item.id, item.label]));

export function defaultUseTagsForType(type) {
  return VEHICLE_USE_OPTIONS
    .filter(item => item.types.includes(type))
    .map(item => item.id);
}
