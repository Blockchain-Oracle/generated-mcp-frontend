import { useTheme } from "./ThemeProvider"
import { motion, AnimatePresence } from "framer-motion"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex items-center justify-center rounded-full w-10 h-10 bg-background border border-input hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden transition-colors"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {isDark ? (
             <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          )}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </motion.button>
  )
}
