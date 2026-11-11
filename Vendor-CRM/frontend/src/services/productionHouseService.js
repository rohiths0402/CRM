
import api from "./api";

const STORAGE_KEY = "production_houses_mock_data";

const USE_MOCK_API =
  import.meta.env.VITE_USE_MOCK_DATA !== "false";

const initialHouses = [
  {
    id: "PH001",
    companyName: "Sun Pictures",
    contactPerson: "Production Manager",
    email: "contact@sunpictures.in",
    phone: "9876543210",
    location: "Chennai, Tamil Nadu",
    website: "www.sunpictures.in",
    status: "Active",
    description: "Film production and distribution company.",
  },
  {
    id: "PH002",
    companyName: "Lyca Productions",
    contactPerson: "Production Manager",
    email: "info@lycaproductions.in",
    phone: "9876543211",
    location: "Chennai, Tamil Nadu",
    website: "www.lycaproductions.in",
    status: "Active",
    description: "Film production company.",
  },
  {
    id: "PH003",
    companyName: "Dream Warrior Pictures",
    contactPerson: "Production Manager",
    email: "info@dwp.in",
    phone: "9876543212",
    location: "Chennai, Tamil Nadu",
    website: "www.dwp.in",
    status: "Inactive",
    description: "Film production company.",
  },
];

const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function readMockData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    console.warn("Unable to read production house mock data.");
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialHouses));

  return initialHouses;
}

function saveMockData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const productionHouseService = {
  async getAll() {
    if (!USE_MOCK_API) {
      return api.get("/production-houses");
    }

    await delay();

    return readMockData();
  },

  async getById(id) {
    if (!USE_MOCK_API) {
      return api.get(`/production-houses/${id}`);
    }

    await delay();

    const house = readMockData().find(
      (item) => String(item.id) === String(id)
    );

    if (!house) throw new Error("Production house not found.");

    return house;
  },

  async create(payload) {
    if (!USE_MOCK_API) {
      return api.post("/production-houses", payload);
    }

    await delay();

    const houses = readMockData();

    const newHouse = {
      ...payload,
      id: `PH${Date.now()}`,
    };

    saveMockData([newHouse, ...houses]);

    return newHouse;
  },

  async update(id, payload) {
    if (!USE_MOCK_API) {
      return api.put(`/production-houses/${id}`, payload);
    }

    await delay();

    const houses = readMockData();

    const exists = houses.some(
      (item) => String(item.id) === String(id)
    );

    if (!exists) throw new Error("Production house not found.");

    const updated = houses.map((item) =>
      String(item.id) === String(id)
        ? { ...item, ...payload, id: item.id }
        : item
    );

    saveMockData(updated);

    return updated.find((item) => String(item.id) === String(id));
  },

  async delete(id) {
    if (!USE_MOCK_API) {
      return api.delete(`/production-houses/${id}`);
    }

    await delay();

    const houses = readMockData();

    const updated = houses.filter(
      (item) => String(item.id) !== String(id)
    );

    if (updated.length === houses.length) {
      throw new Error("Production house not found.");
    }

    saveMockData(updated);

    return { success: true };
  },
};

export default productionHouseService;
