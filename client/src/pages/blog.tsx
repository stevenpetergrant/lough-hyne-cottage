import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, MapPin, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import SEOHead from "@/components/seo-head";
import { useState } from "react";
import { formatDate } from "@/lib/dateUtils";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  readTime: string;
}

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "The Best Restaurants in West Cork (2025 Edition)",
      excerpt: "From harbourside gems to local legends, discover the culinary scene where creativity meets craftsmanship in Ireland's wildest corner.",
      content: `West Cork isn't just a place—it's a feeling. A wild, windswept region where creativity meets craftsmanship, and where food is deeply tied to the land and sea. Whether you're winding your way through coastal villages or seeking out hidden inland gems, the culinary scene here is one of Ireland's finest.

Here's your essential guide to the best restaurants, pubs, and food spots in West Cork, freshly curated for 2025.

**✨ Standout Dining Experiences**

**Chestnut – Ballydehob**
A Michelin-starred experience in an unassuming village setting. Chef Rob Krawczyk delivers a tasting menu that feels like storytelling through food—rooted in local, seasonal produce with beautifully executed flair. Booking ahead is essential.

**The Customs House – Baltimore**
Housed in a converted fish processing plant beside the water, this is modern Irish cuisine done with elegance and soul. Seafood is the star, but the artistry of each dish and the cozy-meets-contemporary setting make it unforgettable. A must-visit when in Baltimore.

**Babade – Schull**
Creative and contemporary, Babade brings bold flavor to a small space. With its relaxed atmosphere and plates that balance precision and personality, this spot is earning a quiet cult following.

**Blairscove House – Durrus**
Dinner at Blairscove is a special occasion kind of meal, set in a historic Georgian estate overlooking the bay. Their famous hors d'oeuvres table is a meal in itself, and the main courses (think West Cork beef or halibut) are refined and satisfying.

**🐟 Coastal Eats & Seafood Staples**

**The Dock Wall – Union Hall**
Right on the water, this charming little spot is all about ultra-fresh seafood—lobster, crab, langoustines, and grilled fish done simply and perfectly. A local favorite, especially at golden hour.

**Arundels by the Pier – Ahakista**
A beloved pier-side pub that captures everything great about West Cork: friendly service, delicious food, and a view that could calm any storm. Great for long lunches with a pint and some fish and chips, or evening meals with fresh, local ingredients.

**Budds – Ballydehob**
A daytime favourite known for its commitment to sustainability and quality. Expect colourful salads, fresh seafood, excellent coffee, and a menu that makes vegetarians feel just as welcome as seafood lovers.

**🍻 Pubs with Proper Food (and Character to Spare)**

**Hudsons – Ballydehob**
The heart of the village and a cracking spot for classic pub fare done well. Expect local meats, hearty portions, and a great pint. Live music nights are common and the crowd is always friendly.

**The Algiers Inn – Baltimore**
Casual, cool, and buzzing in summer, this waterside inn is known for its local seafood platters, crisp pints, and a relaxed vibe that screams holiday mode. Grab a seat outside when the sun's out.

**Bushes Bar – Baltimore**
One of Baltimore's most iconic pubs, with old-world maritime charm, a loyal local crowd, and a kitchen that punches well above its weight. Order the seafood chowder and a pint of Murphy's, and you're set.

**Casey's of Baltimore**
Part pub, part restaurant, part guesthouse—and all charm. Casey's serves generous portions of traditional Irish fare and seafood dishes with real heart. Their mussels in white wine and garlic are always a crowd-pleaser.

**Final Thoughts**
West Cork doesn't shout about its food scene—it doesn't need to. From the kitchens of award-winning chefs to the hands of local fishermen and bakers, there's a quiet pride here in doing things right. The result? Meals that are rooted in place, rich in story, and impossible to forget.

So grab your map, your appetite, and maybe a good raincoat—and get ready to taste your way through one of Ireland's most delicious regions.`,
      author: "Lough Hyne Cottage",
      date: "2024-12-01",
      category: "Food & Drink",
      imageUrl: "https://loughhynecottage.com/wp-content/uploads/2024/08/bread-course-4-1.jpg",
      readTime: "8 min read"
    }
  ];

  const categories = ["All", "Food & Drink"];

  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Wonderful West Cork - Lough Hyne Cottage Travel Guide",
    "description": "Discover the best of West Cork with insider guides to restaurants, attractions, nature spots and cultural experiences from Lough Hyne Cottage.",
    "url": "https://loughhynecottage.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Lough Hyne Cottage",
      "url": "https://loughhynecottage.com"
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "author": {
        "@type": "Organization",
        "name": post.author
      },
      "datePublished": post.date,
      "image": post.imageUrl,
      "articleSection": post.category,
      "keywords": post.category === "Food & Drink" ? "West Cork restaurants, local food Cork, dining Skibbereen" :
                  post.category === "Local Attractions" ? "West Cork attractions, Beara Peninsula, Sheep's Head" :
                  post.category === "Nature & Wildlife" ? "Lough Hyne nature reserve, West Cork wildlife" :
                  "West Cork culture, Irish arts, traditional crafts"
    }))
  };

  return (
    <div className="min-h-screen bg-natural-white">
      <SEOHead
        title="Wonderful West Cork Travel Guide - Lough Hyne Cottage Blog"
        description="Discover the best of West Cork with insider guides to restaurants, attractions, nature spots and cultural experiences. Local recommendations from Lough Hyne Cottage hosts."
        keywords="West Cork guide, Cork travel blog, Skibbereen attractions, West Cork restaurants, Irish travel guide, Lough Hyne area guide"
        url="https://loughhynecottage.com/blog"
        structuredData={blogStructuredData}
      />
      <Navigation />
      
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-forest mb-4">
              Wonderful West Cork
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Discover the magic, culture, and natural beauty of Ireland's most enchanting corner through our local insights and stories.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Badge 
                key={category}
                variant="outline"
                className="cursor-pointer hover:bg-sage/20 border-sage text-forest"
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Featured Post */}
          <div className="mb-16">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid md:grid-cols-2">
                <div className="aspect-[4/3] md:aspect-auto">
                  <img 
                    src={blogPosts[0].imageUrl}
                    alt={blogPosts[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge variant="secondary" className="w-fit mb-4 bg-terracotta/20 text-terracotta">
                    Featured
                  </Badge>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-forest mb-4">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="mr-4">{formatDate(blogPosts[0].date)}</span>
                    <span>{blogPosts[0].readTime}</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-fit bg-forest text-white hover:bg-forest/80">
                        Read More
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-heading text-2xl font-bold text-forest">
                          {blogPosts[0].title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <img 
                          src={blogPosts[0].imageUrl}
                          alt={blogPosts[0].title}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <div className="flex items-center text-sm text-gray-500 gap-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(blogPosts[0].date)}</span>
                          </div>
                          <span>By {blogPosts[0].author}</span>
                          <span>{blogPosts[0].readTime}</span>
                        </div>
                        <div className="prose prose-lg max-w-none space-y-6">
                          <p className="text-gray-700 leading-relaxed">
                            West Cork isn't just a place—it's a feeling. A wild, windswept region where creativity meets craftsmanship, and where food is deeply tied to the land and sea.
                          </p>

                          <h3 className="font-semibold text-xl text-forest mt-8 mb-6">✨ Standout Dining Experiences</h3>

                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">Chestnut – Ballydehob</h4>
                              <img 
                                src="/attached_assets/0065e263-1c66-4e24-ac8d-7e970e07c613.avif"
                                alt="Chestnut Restaurant Ballydehob"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                A Michelin-starred experience in an unassuming village setting. Chef Rob Krawczyk delivers a tasting menu that feels like storytelling through food.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">The Customs House – Baltimore</h4>
                              <img 
                                src="/attached_assets/1fcdcbe1-8e25-4379-8348-5cf861dcb9a9.avif"
                                alt="The Customs House Restaurant Baltimore"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                Housed in a converted fish processing plant beside the water, this is modern Irish cuisine done with elegance and soul.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">Babade – Schull</h4>
                              <img 
                                src="/attached_assets/31d30d30-f0ad-4f30-948b-750ffef9b695.avif"
                                alt="Babade Restaurant Schull"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                Creative and contemporary, Babade brings bold flavor to a small space with plates that balance precision and personality.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">Blairscove House – Durrus</h4>
                              <img 
                                src="/attached_assets/3e6384b4-52b2-4806-a231-cfeac7f37ecd.avif"
                                alt="Blairscove House Restaurant Durrus"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                A special occasion meal set in a historic Georgian estate overlooking the bay with refined West Cork beef and halibut.
                              </p>
                            </div>
                          </div>

                          <h3 className="font-semibold text-xl text-forest mt-8 mb-6">🐟 Coastal Eats & Seafood Staples</h3>

                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">The Dock Wall – Union Hall</h4>
                              <img 
                                src="/attached_assets/40755218-51a7-4bac-8253-f0945d021716.avif"
                                alt="The Dock Wall Restaurant Union Hall"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                Ultra-fresh seafood—lobster, crab, langoustines, and grilled fish done simply and perfectly. A local favorite at golden hour.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">Arundels by the Pier – Ahakista</h4>
                              <img 
                                src="/attached_assets/47f2fc56-77da-4be3-ac46-28261dc0e195.avif"
                                alt="Arundels by the Pier Ahakista"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                A beloved pier-side pub with friendly service, delicious food, and views that could calm any storm.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">Budds – Ballydehob</h4>
                              <img 
                                src="/attached_assets/564ffca7-24e6-4a46-b1c3-01594660fee4 (1).avif"
                                alt="Budds Restaurant Ballydehob"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                Known for sustainability and quality with colorful salads, fresh seafood, and excellent coffee.
                              </p>
                            </div>
                          </div>

                          <h3 className="font-semibold text-xl text-forest mt-8 mb-6">🍻 Pubs with Proper Food</h3>

                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">Hudsons – Ballydehob</h4>
                              <img 
                                src="/attached_assets/7a9c92b2-d126-400f-80d1-e94fefe359df.avif"
                                alt="Hudsons Pub Ballydehob"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                The heart of the village with classic pub fare, local meats, hearty portions, and live music nights.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">The Algiers Inn – Baltimore</h4>
                              <img 
                                src="/attached_assets/952f61ad-3790-4119-9d33-e66172515cd5.avif"
                                alt="The Algiers Inn Baltimore"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                Casual and buzzing in summer, known for local seafood platters and a relaxed holiday vibe.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">Bushes Bar – Baltimore</h4>
                              <img 
                                src="/attached_assets/a9b87a9f-a157-4e44-81b2-4ad272b82ff6.avif"
                                alt="Bushes Bar Baltimore"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                One of Baltimore's most iconic pubs with maritime charm and exceptional seafood chowder.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-lg text-forest mb-3">Casey's of Baltimore</h4>
                              <img 
                                src="/attached_assets/b676476a-ceb8-4432-bf28-51f88ff4f9bd.avif"
                                alt="Casey's of Baltimore"
                                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <p className="text-gray-700 leading-relaxed">
                                Part pub, part restaurant, part guesthouse—serving traditional Irish fare with real heart.
                              </p>
                            </div>
                          </div>

                          <div className="mt-8 p-6 bg-sage/10 rounded-lg">
                            <h3 className="font-semibold text-lg text-forest mb-3">Final Thoughts</h3>
                            <p className="text-gray-700 leading-relaxed">
                              West Cork doesn't shout about its food scene—it doesn't need to. The result? Meals that are rooted in place, rich in story, and impossible to forget.
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          </div>

          {/* Blog Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs border-sage text-forest">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <CardTitle className="font-heading text-lg text-forest line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(post.date)}
                    </div>
                    <span>By {post.author}</span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full text-forest hover:bg-sage/20 text-sm">
                        Read Full Article
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-heading text-2xl font-bold text-forest">
                          {post.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <img 
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <div className="flex items-center text-sm text-gray-500 gap-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(post.date)}</span>
                          </div>
                          <span>By {post.author}</span>
                          <span>{post.readTime}</span>
                        </div>
                        <div className="prose prose-lg max-w-none">
                          {post.content.split('\n\n').map((paragraph, index) => {
                            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                              const title = paragraph.replace(/\*\*/g, '');
                              
                              // Add images for specific restaurants if this is the restaurant post
                              let imageUrl = null;
                              if (post.id === 1) {
                                if (title.includes('Chestnut')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                } else if (title.includes('Customs House')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                } else if (title.includes('Babade')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                } else if (title.includes('Blairscove')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                } else if (title.includes('Dock Wall')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                } else if (title.includes('Arundels')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                } else if (title.includes('Budds')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                } else if (title.includes('Hudsons')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1481833761820-0509d3217039?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                } else if (title.includes('Algiers')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                } else if (title.includes('Bushes')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1436564989038-ac2d6cc36543?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                } else if (title.includes('Casey')) {
                                  imageUrl = 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                }
                              }
                              
                              return (
                                <div key={index} className="mb-8">
                                  <h3 className="font-semibold text-xl text-forest mt-6 mb-3">
                                    {title}
                                  </h3>
                                  {imageUrl && (
                                    <img 
                                      src={imageUrl}
                                      alt={title}
                                      className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                                    />
                                  )}
                                </div>
                              );
                            }
                            return (
                              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                                {paragraph}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="mt-20 bg-gradient-to-r from-sage/20 to-terracotta/20 rounded-2xl p-8 text-center">
            <h3 className="font-heading text-2xl font-bold text-forest mb-4">
              Stay Connected with West Cork
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Get our latest stories about West Cork's hidden gems, seasonal recipes, and local events delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage"
              />
              <Button className="bg-forest text-white hover:bg-forest/80">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}