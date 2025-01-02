const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api/eshopapi_v1.yml'); // načtení OpenAPI specifikace

const hateoasMiddleware = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body && typeof body === 'object') {
      const addLinksToEntity = (entity, entityId) => {
        const links = {};
        Object.keys(swaggerDocument.paths).forEach(path => {
          if (path.includes(`{${entityId}}`)) {
            const cleanPath = path.replace(`{${entityId}}`, entity[entityId]);
            const key = cleanPath.split('/')[2] || cleanPath.split('/')[1];
            links[key] = { href: cleanPath, method: 'GET' }; // Přidání metody
          }
        });
        return { ...entity, _links: links };
      };

      if (Array.isArray(body)) {
        body = body.map(item => addLinksToEntity(item, 'id'));
      } else {
        body = addLinksToEntity(body, 'id');
      }
    }
    return originalJson.call(this, body);
  };
  next();
};

module.exports = hateoasMiddleware;