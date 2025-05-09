const Messages = {
    errors: {
        notFound: (entityName = "datos") => `No hay ${entityName} disponibles`,
        serverError: "Error interno del servidor",
    },
    success: {
        get: (entityName = "datos") => `Se encontraron ${entityName}.`
    }
};

const Entity = {
    PLANES: "planes",
    CATEGORIAS: "categorias",
    PROVINCIAS: "provincias",
    LOCALIDADES: "localidades",
    ESPECIALIDADES: "especialidades",
    PRESTADORES: "prestadores",
    CARTILLA: "cartilla"
};

module.exports = { Messages, Entity };