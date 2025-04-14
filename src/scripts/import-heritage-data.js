import { MongoClient } from 'mongodb';
import { env } from '../config/environment.js';
import fs from 'fs';
import path from 'path';

const INPUT_FILE = path.join('..', 'heritage-crawler', 'data', 'raw', 'vietnam-heritage-sites-filtered.json');

async function importHeritageData() {
  let client;
  try {
    // Kết nối MongoDB
    client = new MongoClient(env.MONGODB_URI);
    await client.connect();
    console.log('Đã kết nối MongoDB thành công');

    const db = client.db(env.DATABASE_NAME);
    const collection = db.collection('HistoryHeritage');

    // Đọc dữ liệu từ file JSON
    const data = fs.readFileSync(INPUT_FILE, 'utf8');
    const heritages = JSON.parse(data);

    // Chuyển đổi dữ liệu
    const formattedHeritages = heritages.map(heritage => ({
      name: heritage.name,
      description: heritage.description,
      images: heritage.imageUrl ? [heritage.imageUrl] : [],
      location: heritage.location,
      coordinates: heritage.coordinates,
      stats: {
        averageRating: 0,
        totalReviews: 0,
        totalVisits: 0,
        totalFavorites: 0
      },
      knowledgeTestId: null,
      leaderboardId: null,
      leaderboardSummary: {
        topScore: 0,
        topUser: {
          userId: null,
          userName: ''
        },
        totalParticipants: 0
      },
      knowledgeTestSummary: {
        title: '',
        questionCount: 0,
        difficulty: 'Medium'
      },
      rolePlayIds: [],
      additionalInfo: {
        architectural: heritage.architectural || null,
        culturalFestival: heritage.culturalFestival || null,
        historicalEvents: formatHistoricalEvents(heritage.events)
      },
      status: 'ACTIVE',
      popularTags: createPopularTags(heritage.types),
      createdAt: new Date(),
      updatedAt: null
    }));

    // Xóa dữ liệu cũ nếu có
    await collection.deleteMany({});
    console.log('Đã xóa dữ liệu cũ');

    // Thêm dữ liệu mới
    const result = await collection.insertMany(formattedHeritages);
    console.log(`Đã thêm ${result.insertedCount} di sản vào cơ sở dữ liệu`);

  } catch (error) {
    console.error('Lỗi trong quá trình import:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Đã đóng kết nối MongoDB');
    }
  }
}

// Hàm để định dạng sự kiện lịch sử
function formatHistoricalEvents(events) {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return [];
  }

  return events.map(event => ({
    title: event.title,
    description: event.description
  }));
}

// Hàm để tạo thẻ phổ biến
function createPopularTags(types) {
  if (!types) return ['Di tích lịch sử'];

  const tagsArray = types.split(',').map(tag => tag.trim());

  if (!tagsArray.includes('Di tích lịch sử')) {
    tagsArray.unshift('Di tích lịch sử');
  }

  return tagsArray;
}

// Chạy hàm import
importHeritageData(); 