import ThemeToggle from "../ThemeToggle";

// Header component
const Header = () => {
  return (
    <header className="w-full p-4 border-b border-gray-900 bg-gray-900 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
      <h2 className="font-semibold">Zuno Chat</h2>
      <ThemeToggle />
    </header>
  );
};

export default Header;