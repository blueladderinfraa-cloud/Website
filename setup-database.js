#!/usr/bin/env node

/**
 * Database Setup Script for Blueladder Infrastructure Website
 * This script initializes the database with sample data for development
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './drizzle/schema-sqlite.ts';

const DATABASE_URL = process.env.DATABASE_URL || 'file:./local.db';

async function setupDatabase() {
  console.log('🚀 Setting up Blueladder Infrastructure database...');
  
  try {
    // Initialize SQLite database
    const sqlite = new Database('./local.db');
    const db = drizzle(sqlite, { schema });

    console.log('✅ Database connection established');

    // Create admin user
    const adminUser = {
      openId: 'admin-local-dev',
      name: 'Admin User',
      email: 'admin@blueladder.com',
      role: 'admin',
      loginMethod: 'local',
    };

    await db.insert(schema.users).values(adminUser).onConflictDoNothing();
    console.log('✅ Admin user created');

    // Create sample projects
    const sampleProjects = [
      {
        title: 'Luxury Residential Complex',
        slug: 'luxury-residential-complex',
        description: 'A premium residential development featuring modern amenities and sustainable design.',
        location: 'Downtown District',
        status: 'ongoing',
        category: 'residential',
        featured: true,
        progress: 65,
        sqftBuilt: 25000,
        budget: '2500000',
        coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      },
      {
        title: 'Commercial Office Tower',
        slug: 'commercial-office-tower',
        description: 'State-of-the-art office building with smart building technology.',
        location: 'Business District',
        status: 'completed',
        category: 'commercial',
        featured: true,
        progress: 100,
        sqftBuilt: 50000,
        budget: '5000000',
        coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      },
      {
        title: 'Industrial Warehouse Facility',
        slug: 'industrial-warehouse-facility',
        description: 'Modern warehouse and distribution center with automated systems.',
        location: 'Industrial Zone',
        status: 'upcoming',
        category: 'industrial',
        featured: false,
        progress: 0,
        sqftBuilt: 75000,
        budget: '3500000',
        coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
      }
    ];

    for (const project of sampleProjects) {
      await db.insert(schema.projects).values(project).onConflictDoNothing();
    }
    console.log('✅ Sample projects created');

    // Create sample services
    const sampleServices = [
      {
        title: 'Residential Construction',
        slug: 'residential-construction',
        shortDescription: 'Custom homes and residential developments',
        fullDescription: 'We specialize in building custom homes, residential complexes, and housing developments with attention to detail and quality craftsmanship.',
        category: 'residential',
        icon: 'Home',
        isActive: true,
        sortOrder: 1,
        features: JSON.stringify(['Custom Design', 'Quality Materials', 'Timely Delivery', 'Warranty Support'])
      },
      {
        title: 'Commercial Construction',
        slug: 'commercial-construction',
        shortDescription: 'Office buildings and commercial spaces',
        fullDescription: 'From office towers to retail spaces, we deliver commercial construction projects that meet modern business needs.',
        category: 'commercial',
        icon: 'Building',
        isActive: true,
        sortOrder: 2,
        features: JSON.stringify(['Modern Design', 'Smart Building Tech', 'Energy Efficient', 'Code Compliance'])
      },
      {
        title: 'Industrial Construction',
        slug: 'industrial-construction',
        shortDescription: 'Warehouses and manufacturing facilities',
        fullDescription: 'Specialized in industrial construction including warehouses, manufacturing plants, and distribution centers.',
        category: 'industrial',
        icon: 'Factory',
        isActive: true,
        sortOrder: 3,
        features: JSON.stringify(['Heavy Duty Construction', 'Safety Standards', 'Automated Systems', 'Scalable Design'])
      },
      {
        title: 'Infrastructure Development',
        slug: 'infrastructure-development',
        shortDescription: 'Roads, bridges, and public works',
        fullDescription: 'Large-scale infrastructure projects including roads, bridges, utilities, and public facilities.',
        category: 'infrastructure',
        icon: 'Road',
        isActive: true,
        sortOrder: 4,
        features: JSON.stringify(['Public Works', 'Utility Systems', 'Transportation', 'Environmental Compliance'])
      }
    ];

    for (const service of sampleServices) {
      await db.insert(schema.services).values(service).onConflictDoNothing();
    }
    console.log('✅ Sample services created');

    // Create sample testimonials
    const sampleTestimonials = [
      {
        clientName: 'John Smith',
        clientTitle: 'CEO',
        clientCompany: 'Smith Enterprises',
        content: 'Blueladder delivered our office building on time and within budget. Exceptional quality and professionalism.',
        rating: 5,
        featured: true,
        isActive: true,
      },
      {
        clientName: 'Sarah Johnson',
        clientTitle: 'Property Developer',
        clientCompany: 'Johnson Properties',
        content: 'Outstanding work on our residential complex. The attention to detail and customer service was remarkable.',
        rating: 5,
        featured: true,
        isActive: true,
      }
    ];

    for (const testimonial of sampleTestimonials) {
      await db.insert(schema.testimonials).values(testimonial).onConflictDoNothing();
    }
    console.log('✅ Sample testimonials created');

    // Create site statistics
    const siteStats = [
      { key: 'projects_completed', value: 78, label: 'Projects Completed', suffix: '+', sortOrder: 1 },
      { key: 'sqft_built', value: 2000000, label: 'Million Sq. Ft. Built', suffix: '+', sortOrder: 2 },
      { key: 'happy_clients', value: 105, label: 'Happy Clients', suffix: '+', sortOrder: 3 },
      { key: 'years_experience', value: 18, label: 'Years Experience', suffix: '+', sortOrder: 4 },
    ];

    for (const stat of siteStats) {
      await db.insert(schema.siteStats).values(stat).onConflictDoNothing();
    }
    console.log('✅ Site statistics created');

    // Create sample site content
    const siteContentData = [
      {
        section: 'hero',
        key: 'title',
        value: 'Building Excellence, Delivering Dreams',
        type: 'text'
      },
      {
        section: 'hero',
        key: 'subtitle',
        value: 'Premier construction company with 18+ years of experience in residential, commercial, and industrial projects.',
        type: 'text'
      },
      {
        section: 'about',
        key: 'title',
        value: 'About Blueladder Infrastructure',
        type: 'text'
      },
      {
        section: 'about',
        key: 'description',
        value: 'With over 18 years of experience, Blueladder Infrastructure has established itself as a leading construction company, delivering high-quality projects across residential, commercial, industrial, and infrastructure sectors.',
        type: 'text'
      }
    ];

    for (const content of siteContentData) {
      await db.insert(schema.siteContent).values(content).onConflictDoNothing();
    }
    console.log('✅ Site content created');

    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Setup Summary:');
    console.log('   • Admin user: admin@blueladder.com (role: admin)');
    console.log('   • Sample projects: 3 projects created');
    console.log('   • Sample services: 4 services created');
    console.log('   • Sample testimonials: 2 testimonials created');
    console.log('   • Site statistics: 4 stats created');
    console.log('   • Site content: Basic CMS content created');
    console.log('');
    console.log('🚀 You can now start the development server with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };