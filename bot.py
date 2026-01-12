# JahCloud Telegram Bot v2.0
# Optimized for Mini App & Firebase

import os
import json
import logging
import aiohttp
from datetime import datetime
from telegram import (
    Update, 
    InlineKeyboardButton, 
    InlineKeyboardMarkup,
    WebAppInfo
)
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters
)

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Configuration
BOT_TOKEN = '8492229833:AAF_xqaaq7Fu_ChaJaA78Fe-P45E-rxlkeQ'
WEBAPP_URL = 'https://lion16aspirin-web.github.io/jahclouds/'
ADMIN_ID = None  # Set your Telegram ID here

# Firebase Configuration
FIREBASE_PROJECT_ID = 'jahcloud-9019b'
FIREBASE_API_KEY = 'AIzaSyCIpiVZTHVtFY9rYVcHlBArfDA34FvjnJw'
FIRESTORE_URL = f'https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents'

# ============ FIREBASE FUNCTIONS ============
async def get_firebase_user(telegram_id: int):
    """Get user from Firebase by Telegram ID"""
    try:
        url = f"{FIRESTORE_URL}/users/tg_{telegram_id}?key={FIREBASE_API_KEY}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return parse_firestore_doc(data.get('fields', {}))
    except Exception as e:
        logger.error(f"Firebase get user error: {e}")
    return None

async def create_firebase_user(user_data: dict):
    """Create or update user in Firebase"""
    try:
        doc_id = f"tg_{user_data['telegramId']}"
        url = f"{FIRESTORE_URL}/users/{doc_id}?key={FIREBASE_API_KEY}"
        
        # Convert to Firestore format
        firestore_data = {
            "fields": {
                "id": {"stringValue": doc_id},
                "telegramId": {"integerValue": str(user_data['telegramId'])},
                "name": {"stringValue": user_data.get('name', '')},
                "username": {"stringValue": user_data.get('username', '')},
                "provider": {"stringValue": "telegram"},
                "bonuses": {"integerValue": str(user_data.get('bonuses', 50))},
                "createdAt": {"stringValue": user_data.get('createdAt', '')},
                "phone": {"stringValue": user_data.get('phone', '')}
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, json=firestore_data) as response:
                return response.status in [200, 201]
    except Exception as e:
        logger.error(f"Firebase create user error: {e}")
    return False

async def save_order_to_firebase(order_data: dict):
    """Save order to Firebase"""
    try:
        url = f"{FIRESTORE_URL}/orders?key={FIREBASE_API_KEY}"
        
        firestore_data = {
            "fields": {
                "userId": {"stringValue": f"tg_{order_data['userId']}"},
                "telegramId": {"integerValue": str(order_data['userId'])},
                "items": {"stringValue": json.dumps(order_data['items'])},
                "total": {"integerValue": str(order_data['total'])},
                "status": {"stringValue": order_data.get('status', 'pending')},
                "createdAt": {"stringValue": order_data['createdAt']}
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=firestore_data) as response:
                if response.status in [200, 201]:
                    logger.info(f"Order saved to Firebase")
                    return True
    except Exception as e:
        logger.error(f"Firebase save order error: {e}")
    return False

def parse_firestore_doc(fields: dict) -> dict:
    """Parse Firestore document to Python dict"""
    result = {}
    for key, value in fields.items():
        if 'stringValue' in value:
            result[key] = value['stringValue']
        elif 'integerValue' in value:
            result[key] = int(value['integerValue'])
        elif 'booleanValue' in value:
            result[key] = value['booleanValue']
    return result

# ============ KEYBOARDS ============

def main_menu_keyboard():
    keyboard = [
        [InlineKeyboardButton("🛍 В магазин", web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton("👤 Профіль", callback_data="profile"),
         InlineKeyboardButton("🆘 Підтримка", callback_data="support")]
    ]
    return InlineKeyboardMarkup(keyboard)

def back_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔙 Назад", callback_data="menu")]
    ])

# ============ HANDLERS ============

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    user_id = user.id
    
    # Check if login request from site
    args = context.args
    if args and args[0].startswith('login'):
        # Sync user to Firebase
        user_data = {
            'telegramId': user_id,
            'name': user.full_name,
            'username': user.username or "",
            'bonuses': 50, # Default bonus check handled in create_firebase_user
            'createdAt': datetime.now().isoformat()
        }
        # Check if user exists to preserve bonuses
        existing_user = await get_firebase_user(user_id)
        if existing_user:
            user_data['bonuses'] = existing_user.get('bonuses', 50)
            
        await create_firebase_user(user_data)
        
        await update.message.reply_text(
            f"✅ *Ви успішно авторизовані!*\n\n"
            f"Привіт, {user.first_name}! Тепер ви можете повернутись на сайт.",
            parse_mode='Markdown',
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("🌐 Перейти на сайт", web_app=WebAppInfo(url=WEBAPP_URL))]
            ])
        )
        return

    # Standard /start
    text = (
        f"💨 *JahCloud Vape Shop*\n\n"
        f"Привіт, {user.first_name}! 👋\n\n"
        "Тут ти знайдеш найкращі HHC одноразки та аксесуари.\n"
        "Замовляй через наш зручний Mini App!\n\n"
        "🎁 *Бонусна система:*\n"
        "• 50 грн за реєстрацію\n"
        "• 5% кешбек з покупок\n\n"
        "👇 Тисни кнопку нижче:"
    )
    
    await update.message.reply_text(
        text,
        parse_mode='Markdown',
        reply_markup=main_menu_keyboard()
    )

async def profile(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    
    # Get user data from Firebase
    msg = await update.effective_message.reply_text("🔄 Завантаження профілю...")
    
    firebase_user = await get_firebase_user(user.id)
    bonuses = firebase_user.get('bonuses', 0) if firebase_user else 50
    
    text = (
        f"👤 *Мій профіль*\n\n"
        f"🆔 ID: `{user.id}`\n"
        f"💎 Бонуси: *{bonuses}*\n\n"
        f"💡 Використовуйте бонуси при оформленні замовлення на сайті!"
    )
    
    if update.callback_query:
        await update.callback_query.message.edit_text(
            text, parse_mode='Markdown', reply_markup=back_keyboard()
        )
    else:
        await msg.edit_text(
            text, parse_mode='Markdown', reply_markup=back_keyboard()
        )

async def support(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "🆘 *Підтримка*\n\n"
        "Маєте питання чи проблему? Зв'яжіться з нами:\n\n"
        "👨‍💻 Менеджер: @jahcloud_support\n"
        "📞 Телефон: +380 XX XXX XX XX\n"
        "⏰ Графік: 10:00 - 22:00"
    )
    
    if update.callback_query:
        await update.callback_query.message.edit_text(
            text, parse_mode='Markdown', reply_markup=back_keyboard()
        )
    else:
        await update.effective_message.reply_text(
            text, parse_mode='Markdown', reply_markup=back_keyboard()
        )

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    if query.data == "profile":
        await profile(update, context)
    elif query.data == "support":
        await support(update, context)
    elif query.data == "menu":
        await start(update, context)

# ============ MAIN ============

def main():
    application = Application.builder().token(BOT_TOKEN).build()
    
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("profile", profile))
    application.add_handler(CommandHandler("help", support))
    
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Handle incoming Web App data (orders)
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, lambda u, c: None)) # Placeholder

    print("JahCloud Bot Optimized started!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
