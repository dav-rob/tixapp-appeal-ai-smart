

const HeroSection = () => {
  return (
    <section className="text-center py-8 px-4 bg-gradient-to-b from-tixapp-gray/30 to-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-tixapp-navy mb-4 leading-tight">
          Welcome to TixApp
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          Scan. Appeal. Win.
        </p>
        <p className="text-base text-gray-600 max-w-lg mx-auto">
          Use AI to assess your parking tickets and create winning appeals. 
          Fast, professional, and designed to get results.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
