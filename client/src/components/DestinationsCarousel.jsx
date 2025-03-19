import { Carousel, Container } from "react-bootstrap"

const destinations = [
  {
    id: 1,
    name: "Bali, Indonesia",
    description: "Tropical paradise with stunning beaches and rich cultural heritage.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Santorini, Greece",
    description: "Iconic white buildings with blue domes overlooking the Aegean Sea.",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Kyoto, Japan",
    description: "Ancient temples, traditional gardens, and cherry blossoms.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Machu Picchu, Peru",
    description: "Ancient Incan citadel set high in the Andes Mountains.",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "Amalfi Coast, Italy",
    description: "Dramatic coastline with colorful villages perched on cliffs.",
    image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80",
  },
]

export default function DestinationsCarousel() {
  return (
    <section className="destinations-section">
      <Container>
        <h2 className="text-center mb-5">Popular Destinations</h2>

        <Carousel indicators={true} controls={true} interval={5000} className="destination-carousel">
          {destinations.map((destination) => (
            <Carousel.Item key={destination.id}>
              <div className="destination-card mx-auto">
                <img
                  className="destination-image"
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                />
                <div className="destination-overlay">
                  <h3 className="destination-title">{destination.name}</h3>
                  <p className="destination-description">{destination.description}</p>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </section>
  )
}

