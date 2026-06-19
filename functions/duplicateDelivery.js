const processedDeliveries = new Set();
const DELIVERY_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const isDuplicate = (deliveryId) => {
  if (processedDeliveries.has(deliveryId)) {
    console.log(`⚠️ Duplicate delivery: ${deliveryId}`);
    return true;
  }

  processedDeliveries.add(deliveryId);

  // Auto-remove after TTL
  setTimeout(() => {
    processedDeliveries.delete(deliveryId);
  }, DELIVERY_CACHE_TTL);

  return false;
};
