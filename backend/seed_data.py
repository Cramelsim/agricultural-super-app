from app import create_app, db
from app.models import User, Community, CommunityMember, Post
import uuid

app = create_app()

with app.app_context():
    print("🌱 Seeding database with sample data...")
    
    # Get existing users
    admin = User.query.filter_by(username='admin').first()
    farmer = User.query.filter_by(username='john_farmer').first()
    expert = User.query.filter_by(username='dr_agri').first()
    
    if not admin:
        print("❌ Admin user not found. Please run initial setup first.")
        exit(1)
    
    # Create more experts
    experts_data = [
        {
            'username': 'soil_expert',
            'email': 'soil@example.com',
            'full_name': 'Dr. Soil Scientist',
            'bio': 'PhD in Soil Science with 15 years of research in soil health.',
            'location': 'Nairobi, Kenya',
            'expertise_area': 'Soil Science',
            'user_type': 'expert'
        },
        {
            'username': 'agri_tech',
            'email': 'tech@example.com',
            'full_name': 'Tech Farmer',
            'bio': 'Agricultural technology specialist.',
            'location': 'San Francisco, USA',
            'expertise_area': 'Precision Agriculture',
            'user_type': 'expert'
        }
    ]
    
    for data in experts_data:
        if not User.query.filter_by(email=data['email']).first():
            user = User(
                public_id=str(uuid.uuid4()),
                username=data['username'],
                email=data['email'],
                full_name=data['full_name'],
                bio=data['bio'],
                location=data['location'],
                expertise_area=data['expertise_area'],
                user_type=data['user_type'],
                is_active=True
            )
            user.set_password('expert123')
            db.session.add(user)
            print(f"✅ Created expert: {data['full_name']}")
    
    db.session.commit()
    
    # Create communities if they don't exist
    if not Community.query.filter_by(name='Organic Farmers Network').first():
        community = Community(
            public_id=str(uuid.uuid4()),
            name='Organic Farmers Network',
            description='A community dedicated to organic farming practices.',
            admin_id=admin.id,
            category='Farming',
            is_public=True
        )
        db.session.add(community)
        print("✅ Created community: Organic Farmers Network")
    
    if not Community.query.filter_by(name='Dairy Farmers Association').first():
        community = Community(
            public_id=str(uuid.uuid4()),
            name='Dairy Farmers Association',
            description='Connect with dairy farmers worldwide.',
            admin_id=farmer.id if farmer else admin.id,
            category='Livestock',
            is_public=True
        )
        db.session.add(community)
        print("✅ Created community: Dairy Farmers Association")
    
    if not Community.query.filter_by(name='Smart Irrigation Solutions').first():
        community = Community(
            public_id=str(uuid.uuid4()),
            name='Smart Irrigation Solutions',
            description='Discuss modern irrigation techniques.',
            admin_id=expert.id if expert else admin.id,
            category='Technology',
            is_public=True
        )
        db.session.add(community)
        print("✅ Created community: Smart Irrigation Solutions")
    
    db.session.commit()
    
 
