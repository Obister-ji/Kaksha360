
// No imports needed

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white pt-10 sm:pt-12 md:pt-16 pb-6 sm:pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h3 className="font-playfair text-xl text-gold mb-4">Kaksha360</h3>
          <p className="text-white/70 text-sm max-w-md mx-auto">
            Redefining education with excellence, exclusivity, and exceptional results for discerning learners.
          </p>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/50 text-sm">
          &copy; {currentYear} Kaksha360. All rights reserved. | Crafted with excellence in India
        </div>
      </div>
    </footer>
  );
};

export default Footer;
