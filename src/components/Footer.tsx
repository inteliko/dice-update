
const Footer = () => {
  return (
    <footer className="w-full px-4 py-8 mt-8 bg-gray-900 text-white">
      <div className="container mx-auto text-center">
        <p className="mb-4">
          If you found this tool helpful please consider supporting the developer, it is greatly appreciated!{" "}
          <a 
            href="#" 
            className="text-yellow-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy me a coffee
          </a>
        </p>
        <p className="text-sm text-gray-400">
          For business enquiries, questions, or concerns email us at{" "}
          <a 
            href="mailto:dicemosaicgenerator@gmail.com" 
            className="text-dice-primary hover:underline"
          >
            dicemosaicgenerator@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
