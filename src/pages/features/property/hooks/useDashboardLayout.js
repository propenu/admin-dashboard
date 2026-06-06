// Persist layout in localStorage across sessions
function useDashboardLayout(defaultLayout) {
  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem("projects-dashboard-layout");
      return saved ? JSON.parse(saved) : defaultLayout;
    } catch {
      return defaultLayout;
    }
  });

  const saveLayout = useCallback((newLayout) => {
    setLayout(newLayout);
    localStorage.setItem(
      "projects-dashboard-layout",
      JSON.stringify(newLayout),
    );
  }, []);

  return [layout, saveLayout];
}
