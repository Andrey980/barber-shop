import Image from "next/image";
import Link from "next/link";

interface ServiceType {
  name: string;
  price: string;
}

export default function Home() {
  const services: Record<string, ServiceType> = {
    "1": { name: "Corte", price: "R$ 50" },
    "2": { name: "Luzes", price: "R$ 150" },
    "3": { name: "Progressiva", price: "R$ 200" },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-purple-500">GF3W BARBER</h1>
        </div>
        <button className="text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Welcome Section */}
      <section className="mb-8">
        <p className="text-gray-400 text-sm">Faça já o agendamento do serviço!</p>
      </section>

      {/* Services Section */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">SERVIÇOS DISPONÍVEIS</h3>
        <div className="grid gap-4">
          {Object.entries(services).map(([id, service]) => (
            <Link href={`/calendar?service=${id}`} key={id} className="block">
              <div className="bg-gray-800 rounded-lg p-4 transition-transform transform hover:scale-105">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                  </div>
                  <div className="text-purple-500 font-semibold">
                    {service.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
