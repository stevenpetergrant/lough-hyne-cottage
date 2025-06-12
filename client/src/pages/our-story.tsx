import Navigation from "@/components/navigation";
import cottageLife from "@assets/20240828_112944.jpg";
import ourStoryImage from "@assets/875e18f0-63ff-403a-96b2-00b46f716b15.jpg";

export default function OurStory() {
  return (
    <div className="min-h-screen bg-natural-white">
      <Navigation />
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-forest mb-4">
              From Our Heart to Yours
            </h1>
            <h2 className="text-2xl md:text-3xl text-terracotta font-semibold mb-8">
              Our Journey to Lough Hyne
            </h2>
            
            <div className="mb-12">
              <img 
                src="https://loughhynecottage.com/wp-content/uploads/2024/09/our-story-3.jpg" 
                alt="Claire and Steven at Lough Hyne Cottage"
                className="rounded-lg shadow-lg mx-auto max-w-full h-auto"
              />
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <p>
              Welcome to Lough Hyne Cottage, where our dream of simple living met a dash of adventure – and a lot of good food. In 2019, we, Claire and Steven, packed up our Californian lives and headed back to Ireland, ready to embrace a slower, more sustainable way of life. Little did we know, Lough Hyne would turn out to be everything we'd hoped for and then some. It's the kind of place that grabs hold of you and says, "This is home."
            </p>

            <p>
              The land here has a way of making you feel like you've always belonged, and the community? Well, they welcomed us with open arms and plenty of stories. We quickly settled into our new rhythm, fuelled by a passion for food, nature and connecting with the wonderful people around us.
            </p>

            <div className="my-8">
              <img 
                src="https://loughhynecottage.com/wp-content/uploads/2024/09/Our-Story-2.jpg" 
                alt="Lough Hyne Cottage and surroundings"
                className="rounded-lg shadow-lg mx-auto max-w-full h-auto"
              />
            </div>

            <p>
              Each week, we fire up our wood stove to bake bread and pastries, which we then share at the local market – because nothing brings people together like the smell of fresh bread, right? We keep bees (because honey is life) and are constantly in awe of the little creatures who make our world sweeter.
            </p>

            <p>
              We also host monthly yoga mini-retreats, where we get to share our love for hyper-local, veggie-filled meals inspired by our time in California. Think California meets West Cork – fresh, vibrant and utterly delicious.
            </p>

            <div className="my-8">
              <img 
                src="https://loughhynecottage.com/wp-content/uploads/2024/09/our-story-9.jpg" 
                alt="Yoga and wellness at Lough Hyne Cottage"
                className="rounded-lg shadow-lg mx-auto max-w-full h-auto"
              />
            </div>

            <p>
              In our short time here, we've become part of a thriving artisan and artistic community that's as inspiring as it is welcoming. It's been a whirlwind, but we wouldn't have it any other way. We feel incredibly lucky to have found a place where we can live, create and share this beautiful life we've built. So come visit, stay a while, and maybe even bake some bread with us. You'll fit right in.
            </p>

            <div className="my-8">
              <img 
                src={cottageLife} 
                alt="Life at Lough Hyne Cottage"
                className="rounded-lg shadow-lg mx-auto max-w-full h-auto"
              />
            </div>
          </div>

          <div className="mb-8">
            <img 
              src={ourStoryImage} 
              alt="Claire and Steven's journey to Lough Hyne"
              className="rounded-lg shadow-lg mx-auto max-w-full h-auto"
            />
          </div>

          <div className="mt-12 text-center">
            <div className="inline-block bg-sage/10 px-8 py-6 rounded-lg">
              <p className="text-forest font-medium text-lg mb-4">
                Ready to experience Lough Hyne for yourself?
              </p>
              <a 
                href="/booking"
                className="inline-flex items-center px-6 py-3 bg-forest text-white font-medium rounded-full hover:bg-forest/80 transition-colors"
              >
                Book Your Stay
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}