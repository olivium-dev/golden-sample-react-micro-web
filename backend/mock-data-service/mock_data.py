from faker import Faker
from datetime import datetime, timedelta
import random

fake = Faker()

# In-memory storage
users_db = []
data_rows_db = []
settings_db = {
    "id": 1,
    "theme_mode": "light",
    "primary_color": "#61dafb",
    "secondary_color": "#ff6b6b",
    "language": "en",
    "timezone": "UTC",
    "notifications_enabled": True,
    "email_notifications": True,
    "push_notifications": False,
    "auto_save": True,
    "compact_mode": False
}

def generate_mock_users(count=50):
    """Generate mock users"""
    global users_db
    users_db = []
    roles = ['admin', 'user', 'manager', 'viewer']
    
    for i in range(count):
        user = {
            "id": i + 1,
            "email": fake.email(),
            "username": fake.user_name(),
            "full_name": fake.name(),
            "role": random.choice(roles),
            "is_active": random.choice([True, True, True, False]),  # 75% active
            "created_at": datetime.now() - timedelta(days=random.randint(1, 365)),
            "updated_at": datetime.now() - timedelta(days=random.randint(0, 30))
        }
        users_db.append(user)
    
    return users_db

def generate_mock_data_rows(count=100):
    """Generate mock data rows"""
    global data_rows_db
    data_rows_db = []
    categories = ['Sales', 'Marketing', 'Engineering', 'Support', 'Finance', 'Operations']
    statuses = ['active', 'pending', 'completed', 'archived']
    
    for i in range(count):
        data_row = {
            "id": i + 1,
            "name": f"{fake.bs().title()} #{i+1}",
            "category": random.choice(categories),
            "value": round(random.uniform(100, 10000), 2),
            "status": random.choice(statuses),
            "description": fake.sentence(),
            "created_at": datetime.now() - timedelta(days=random.randint(1, 180)),
            "updated_at": datetime.now() - timedelta(days=random.randint(0, 30))
        }
        data_rows_db.append(data_row)
    
    return data_rows_db

def generate_analytics_data():
    """Generate mock analytics data"""
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return {
        "metrics": [
            {
                "title": "Total Revenue",
                "value": "$124,563",
                "change": 12.5,
                "trend": "up",
                "icon": "AttachMoney"
            },
            {
                "title": "Active Users",
                "value": "8,492",
                "change": 8.2,
                "trend": "up",
                "icon": "People"
            },
            {
                "title": "Conversion Rate",
                "value": "3.24%",
                "change": -2.1,
                "trend": "down",
                "icon": "TrendingUp"
            },
            {
                "title": "Avg. Session",
                "value": "4m 32s",
                "change": 5.7,
                "trend": "up",
                "icon": "Schedule"
            }
        ],
        "lineChart": {
            "labels": months[:6],
            "datasets": [
                {
                    "label": "Revenue",
                    "data": [random.randint(15000, 25000) for _ in range(6)],
                    "borderColor": "#61dafb",
                    "backgroundColor": "rgba(97, 218, 251, 0.1)"
                },
                {
                    "label": "Expenses",
                    "data": [random.randint(10000, 18000) for _ in range(6)],
                    "borderColor": "#ff6b6b",
                    "backgroundColor": "rgba(255, 107, 107, 0.1)"
                }
            ]
        },
        "barChart": {
            "labels": ['Sales', 'Marketing', 'Engineering', 'Support', 'Finance'],
            "datasets": [
                {
                    "label": "Q4 2024",
                    "data": [random.randint(50, 150) for _ in range(5)],
                    "backgroundColor": "#61dafb"
                },
                {
                    "label": "Q3 2024",
                    "data": [random.randint(40, 130) for _ in range(5)],
                    "backgroundColor": "#ff6b6b"
                }
            ]
        },
        "pieChart": {
            "labels": ['Desktop', 'Mobile', 'Tablet', 'Other'],
            "data": [45.2, 32.8, 15.3, 6.7]
        }
    }

# Initialize data on module load
generate_mock_users()
generate_mock_data_rows()

