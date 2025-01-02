const YAML = require("yamljs");
const swaggerDocument = YAML.load("./api/eshopapi_v1.yml"); // načtení OpenAPI specifikace
const hateoasMiddleware = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body && typeof body === "object") {
      const addLinksToEntity = (entity, entityId) => {
        const links = {};
        Object.keys(swaggerDocument.paths).forEach((path) => {
          const methods = swaggerDocument.paths[path];
          Object.keys(methods).forEach((method) => {
            if (path.includes(`{${entityId}}`)) {
              const cleanPath = path.replace(`{${entityId}}`, entity[entityId]);
              const key = cleanPath.split("/")[2] || cleanPath.split("/")[1];
              links[key] = { href: cleanPath, method: method.toUpperCase() };
            }
          });
        });
        links["self"] = {
          href: `${req.baseUrl}${req.path}/${entity[entityId]}`,
          method: "GET",
        };
        // Přidání odkazu na /cancel endpointy
        if (swaggerDocument.paths[`${req.path}/{${entityId}}/cancel`]) {
          links["cancel"] = {
            href: `${req.baseUrl}${req.path}/${entity[entityId]}/cancel`,
            method: "POST",
          };
        }
        return { ...entity, _links: links };
      };
      if (Array.isArray(body)) {
        body = body.map((item) => addLinksToEntity(item, "id"));
        // Přidání odkazu na vytvoření nové entity na úrovni seznamu
        body = {
          items: body,
          _links: {
            self: { href: req.originalUrl, method: req.method },
            create: { href: `${req.baseUrl}${req.path}`, method: "POST" },
          },
        };
      } else {
        body = addLinksToEntity(body, "id");

        // Přidání odkazu na aktuálně volanou službu
        body._links.self = { href: req.originalUrl, method: req.method };
      }
    }
    return originalJson.call(this, body);
  };
  next();
};
module.exports = hateoasMiddleware;