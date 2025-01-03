router.get("/categories", (req, res) => {
  try {
    const categories = Array.from(db.categories.values());
    logger.debug("Fetching all categories", { count: categories.length });

    const response = categories.map((category) => ({
      ...category,
      _links: {
        self: `/categories/${category.id}`,
      },
    }));

    res.json(response).links({
      self: { href: '/categories' },
      create: { href: '/categories', method: 'POST' }
    });
  } catch (error) {
    logger.error("Error fetching categories", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});
