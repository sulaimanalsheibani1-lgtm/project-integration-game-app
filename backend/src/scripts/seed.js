import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Scenario from '../models/Scenario.js';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-integration-game');
    console.log('📊 Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Scenario.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create demo users
    const demoUsers = [
      {
        username: 'demostudent',
        email: 'demo@student.com',
        password: 'password',
        firstName: 'Demo',
        lastName: 'Student',
        role: 'student'
      },
      {
        username: 'demoinstructor',
        email: 'demo@instructor.com',
        password: 'password',
        firstName: 'Demo',
        lastName: 'Instructor',
        role: 'instructor'
      },
      {
        username: 'admin',
        email: 'admin@game.com',
        password: 'password',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    ];

    const createdUsers = await User.create(demoUsers);
    console.log(`👥 Created ${createdUsers.length} demo users`);

    // Create wedding scenario
    const weddingScenario = {
      title: 'Perfect Wedding Challenge',
      description: 'Plan and execute a memorable wedding while managing budget, timeline, and unexpected challenges. Navigate vendor negotiations, guest management, and crisis situations in this comprehensive project management simulation.',
      category: 'wedding',
      difficulty: 'medium',
      estimatedDuration: 60,
      maxTeams: 4,
      learningObjectives: [
        'Project Planning and Resource Allocation',
        'Budget Management and Cost Control',
        'Timeline Management and Milestone Tracking',
        'Vendor Coordination and Communication',
        'Crisis Management and Problem Solving',
        'Team Collaboration and Decision Making'
      ],
      gameSettings: {
        initialBudget: {
          min: 15000,
          max: 50000,
          default: 25000
        },
        timeframe: {
          min: 60,
          max: 365,
          default: 120
        },
        resources: [
          {
            id: 'venue',
            name: 'Wedding Venue',
            type: 'venue',
            basePrice: 3000,
            qualityLevels: [
              { level: 'basic', multiplier: 1.0, description: 'Community hall or simple venue' },
              { level: 'premium', multiplier: 1.5, description: 'Hotel or upscale venue' },
              { level: 'luxury', multiplier: 2.5, description: 'Luxury resort or historic mansion' }
            ],
            availability: 'limited',
            requirements: ['booking_deposit', 'insurance']
          },
          {
            id: 'catering',
            name: 'Catering Service',
            type: 'catering',
            basePrice: 50, // per person
            qualityLevels: [
              { level: 'basic', multiplier: 1.0, description: 'Buffet style with basic menu' },
              { level: 'premium', multiplier: 1.8, description: 'Plated dinner with premium options' },
              { level: 'luxury', multiplier: 2.5, description: 'Gourmet cuisine with chef service' }
            ],
            availability: 'always',
            requirements: ['guest_count_confirmation']
          },
          {
            id: 'photography',
            name: 'Wedding Photography',
            type: 'photography',
            basePrice: 1200,
            qualityLevels: [
              { level: 'basic', multiplier: 1.0, description: 'Basic photo package (4 hours)' },
              { level: 'premium', multiplier: 1.6, description: 'Full day coverage with video' },
              { level: 'luxury', multiplier: 2.2, description: 'Premium photographer with extras' }
            ],
            availability: 'limited',
            requirements: ['schedule_coordination']
          },
          {
            id: 'flowers',
            name: 'Floral Arrangements',
            type: 'decoration',
            basePrice: 800,
            qualityLevels: [
              { level: 'basic', multiplier: 1.0, description: 'Simple bouquet and centerpieces' },
              { level: 'premium', multiplier: 1.7, description: 'Full floral design package' },
              { level: 'luxury', multiplier: 2.3, description: 'Premium flowers with elaborate designs' }
            ],
            availability: 'seasonal',
            requirements: ['color_scheme_approval']
          }
        ],
        milestones: [
          {
            id: 'venue_booking',
            title: 'Venue Booking Confirmed',
            description: 'Secure the wedding venue and finalize the date',
            daysFromStart: 7,
            weight: 0.25,
            dependencies: []
          },
          {
            id: 'vendor_selection',
            title: 'Key Vendors Selected',
            description: 'Choose and book catering, photography, and florist',
            daysFromStart: 21,
            weight: 0.30,
            dependencies: ['venue_booking']
          },
          {
            id: 'invitations_sent',
            title: 'Invitations Sent',
            description: 'Design and send wedding invitations to guests',
            daysFromStart: 45,
            weight: 0.15,
            dependencies: ['venue_booking']
          },
          {
            id: 'final_preparations',
            title: 'Final Preparations Complete',
            description: 'Confirm all details and complete final arrangements',
            daysFromStart: 90,
            weight: 0.30,
            dependencies: ['vendor_selection', 'invitations_sent']
          }
        ],
        constraints: [
          {
            type: 'budget',
            description: 'Must stay within allocated budget',
            impact: 'Overspending results in quality compromises or debt'
          },
          {
            type: 'timeline',
            description: 'Wedding date is fixed and cannot be changed',
            impact: 'Delays may result in vendor unavailability or rushed planning'
          },
          {
            type: 'guest_satisfaction',
            description: 'Guest experience must meet quality expectations',
            impact: 'Poor decisions affect overall wedding satisfaction score'
          }
        ]
      },
      disruptionCards: [
        {
          id: 'venue_cancellation',
          title: 'Venue Cancellation Crisis',
          description: 'Your wedding venue has double-booked and cancelled your reservation 3 weeks before the wedding!',
          severity: 'critical',
          category: 'venue',
          triggerConditions: {
            phase: ['execution'],
            timeRemaining: 30,
            random: true
          },
          effects: {
            timeline: 7,
            budget: 500,
            quality: -20,
            teamMorale: -15
          },
          responseOptions: [
            {
              id: 'emergency_venue',
              title: 'Book Emergency Venue',
              description: 'Find and book an available backup venue immediately',
              cost: 2000,
              timeImpact: 3,
              effectiveness: 0.8
            },
            {
              id: 'negotiate_original',
              title: 'Negotiate with Original Venue',
              description: 'Try to resolve the double-booking situation',
              cost: 0,
              timeImpact: 5,
              effectiveness: 0.6
            },
            {
              id: 'outdoor_backup',
              title: 'Switch to Outdoor Venue',
              description: 'Move to a park or outdoor location with tent rental',
              cost: 1200,
              timeImpact: 4,
              effectiveness: 0.7
            }
          ],
          frequency: 'once'
        },
        {
          id: 'weather_forecast',
          title: 'Weather Warning',
          description: 'The weather forecast shows a 70% chance of rain on your wedding day. Your outdoor ceremony may be at risk!',
          severity: 'medium',
          category: 'weather',
          triggerConditions: {
            phase: ['execution'],
            timeRemaining: 14,
            random: true
          },
          effects: {
            quality: -10,
            teamMorale: -5
          },
          responseOptions: [
            {
              id: 'tent_rental',
              title: 'Rent Weather Protection Tent',
              description: 'Secure a large tent for ceremony protection',
              cost: 800,
              timeImpact: 1,
              effectiveness: 0.9
            },
            {
              id: 'indoor_backup',
              title: 'Move Ceremony Indoors',
              description: 'Relocate ceremony to indoor backup location',
              cost: 200,
              timeImpact: 2,
              effectiveness: 0.85
            },
            {
              id: 'weather_insurance',
              title: 'Last-Minute Weather Insurance',
              description: 'Purchase insurance to cover weather-related issues',
              cost: 300,
              timeImpact: 0,
              effectiveness: 0.6
            }
          ],
          frequency: 'once'
        },
        {
          id: 'guest_count_surge',
          title: 'Guest Count Increase',
          description: 'More family members than expected are confirming attendance. Your guest count has increased by 25%!',
          severity: 'medium',
          category: 'logistics',
          triggerConditions: {
            phase: ['planning', 'execution'],
            random: true
          },
          effects: {
            budget: 1500,
            timeline: 2,
            teamMorale: -5
          },
          responseOptions: [
            {
              id: 'expand_catering',
              title: 'Expand Catering Order',
              description: 'Increase food and beverage orders to accommodate extra guests',
              cost: 1200,
              timeImpact: 1,
              effectiveness: 0.9
            },
            {
              id: 'venue_expansion',
              title: 'Expand Venue Space',
              description: 'Secure additional space or upgrade venue package',
              cost: 800,
              timeImpact: 3,
              effectiveness: 0.8
            },
            {
              id: 'limit_guests',
              title: 'Politely Limit Guest List',
              description: 'Have difficult conversations to maintain original guest count',
              cost: 0,
              timeImpact: 2,
              effectiveness: 0.7
            }
          ],
          frequency: 'once'
        }
      ],
      decisions: [
        {
          id: 'budget_allocation',
          title: 'Initial Budget Allocation',
          description: 'How do you want to allocate your wedding budget across different categories?',
          phase: 'planning',
          options: [
            {
              id: 'balanced',
              title: 'Balanced Approach',
              description: 'Distribute budget evenly across all categories',
              consequences: { quality: 5, risk: 0 }
            },
            {
              id: 'venue_focused',
              title: 'Venue-Focused',
              description: 'Spend more on venue and location, less on other items',
              consequences: { quality: 10, risk: 5, budget: 2000 }
            },
            {
              id: 'experience_focused',
              title: 'Experience-Focused',
              description: 'Prioritize food, entertainment, and guest experience',
              consequences: { quality: 8, risk: 3, budget: 1500 }
            }
          ],
          isRequired: true,
          timeLimit: 10
        }
      ],
      scoringCriteria: {
        budgetWeight: 0.25,
        timelineWeight: 0.25,
        qualityWeight: 0.25,
        teamworkWeight: 0.15,
        crisisWeight: 0.10
      },
      narratives: {
        intro: 'Welcome to the Perfect Wedding Challenge! You and your team have been hired as wedding planners for a couple who wants their dream wedding. You have a budget, a timeline, and a lot of decisions to make. Can you create a memorable celebration while managing all the challenges that come your way?',
        phases: {
          planning: 'The planning phase is crucial. Make smart decisions about vendors, budget allocation, and timeline to set yourself up for success.',
          execution: 'Now the real work begins. Execute your plan while handling unexpected challenges and keeping your team coordinated.',
          review: 'Time to see how well you did! Review your performance and learn from both successes and challenges.'
        },
        endings: [
          {
            condition: 'score >= 90',
            title: 'Perfect Wedding!',
            description: 'Congratulations! You planned and executed a flawless wedding that exceeded all expectations.'
          },
          {
            condition: 'score >= 70',
            title: 'Beautiful Wedding',
            description: 'Well done! The wedding was lovely with only minor hiccups that guests barely noticed.'
          },
          {
            condition: 'score >= 50',
            title: 'Decent Wedding',
            description: 'The wedding happened and guests had a good time, though there were some noticeable issues.'
          },
          {
            condition: 'score < 50',
            title: 'Challenging Wedding',
            description: 'The wedding had significant issues, but you learned valuable lessons about project management.'
          }
        ]
      },
      assets: {
        images: [],
        videos: [],
        documents: []
      },
      isActive: true,
      createdBy: createdUsers[1]._id, // Demo instructor
      tags: ['project-management', 'event-planning', 'budget-management', 'crisis-management'],
      playCount: 0,
      averageRating: 0,
      ratings: []
    };

    const createdScenario = await Scenario.create(weddingScenario);
    console.log(`📝 Created wedding scenario: ${createdScenario.title}`);

    console.log('🎉 Database seeded successfully!');
    console.log(`
Demo Accounts:
- Student: demo@student.com / password
- Instructor: demo@instructor.com / password
- Admin: admin@game.com / password

Scenarios Created:
- ${createdScenario.title} (${createdScenario.category})
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seed script
seedData();