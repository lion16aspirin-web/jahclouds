# JahCloud Telegram Bot v2.0
# Повноцінний бот з навігацією, каталогом, кошиком та оплатою Stars

import os
import json
import logging
import aiohttp
from telegram import (
    Update, 
    LabeledPrice, 
    InlineKeyboardButton, 
    InlineKeyboardMarkup,
    ReplyKeyboardMarkup,
    KeyboardButton,
    WebAppInfo
)
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    PreCheckoutQueryHandler,
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
PROVIDER_TOKEN = ""
WEBAPP_URL = 'https://lion16aspirin-web.github.io/jahclouds/'
ADMIN_ID = None  # Set your Telegram ID here

# Firebase Configuration
FIREBASE_PROJECT_ID = 'jahcloud-9019b'
FIREBASE_API_KEY = 'AIzaSyCIpiVZTHVtFY9rYVcHlBArfDA34FvjnJw'
FIRESTORE_URL = f'https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents'

# ============ DATA ============
PRODUCTS = [
    {"id": 1, "name": "Purple Haze HHC", "price": 450, "old_price": 550, "category": "fruity", "puffs": 3000, "emoji": "🟣", "desc": "Насичений фруктовий смак з нотками лісових ягід"},
    {"id": 2, "name": "Mango Kush HHC", "price": 420, "category": "fruity", "puffs": 3000, "emoji": "🥭", "desc": "Тропічний манго з м'яким фінішем"},
    {"id": 3, "name": "Ice Mint HHC", "price": 400, "category": "menthol", "puffs": 2500, "emoji": "❄️", "desc": "Крижаний ментол для справжніх цінителів"},
    {"id": 4, "name": "Blueberry Dream", "price": 480, "old_price": 580, "category": "fruity", "puffs": 4000, "emoji": "🫐", "desc": "Соковита чорниця з кремовим післясмаком"},
    {"id": 5, "name": "Strawberry Fields", "price": 430, "category": "fruity", "puffs": 3000, "emoji": "🍓", "desc": "Стигла полуниця в кожній затяжці"},
    {"id": 6, "name": "Watermelon Ice", "price": 440, "category": "fruity", "puffs": 3500, "emoji": "🍉", "desc": "Кавун з льодяним холодком"},
]

CATEGORIES = {
    "all": "🌿 Всі товари",
    "fruity": "🍓 Фруктові",
    "menthol": "❄️ Ментолові",
    "dessert": "🍰 Десертні"
}

PROMO_CODES = {
    "JAHCLOUD10": {"discount": 10, "type": "percent"},
    "WELCOME": {"discount": 50, "type": "fixed"},
    "VIBE20": {"discount": 20, "type": "percent"}
}

# ============ FIREBASE FUNCTIONS ============
async def get_firebase_user(telegram_id: int):
    """Get user from Firebase by Telegram ID"""
    try:
        url = f"{FIRESTORE_URL}/users?key={FIREBASE_API_KEY}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    documents = data.get('documents', [])
                    for doc in documents:
                        fields = doc.get('fields', {})
                        if fields.get('telegramId', {}).get('integerValue') == str(telegram_id):
                            return parse_firestore_doc(fields)
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
                if response.status in [200, 201]:
                    logger.info(f"Firebase user created/updated: {doc_id}")
                    return True
                else:
                    error = await response.text()
                    logger.error(f"Firebase create user error: {error}")
    except Exception as e:
        logger.error(f"Firebase create user error: {e}")
    return False

async def update_firebase_user_bonuses(telegram_id: int, bonuses: int):
    """Update user bonuses in Firebase"""
    try:
        doc_id = f"tg_{telegram_id}"
        url = f"{FIRESTORE_URL}/users/{doc_id}?updateMask.fieldPaths=bonuses&key={FIREBASE_API_KEY}"
        
        firestore_data = {
            "fields": {
                "bonuses": {"integerValue": str(bonuses)}
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, json=firestore_data) as response:
                return response.status in [200, 201]
    except Exception as e:
        logger.error(f"Firebase update bonuses error: {e}")
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

# ============ USER DATA ============
user_carts = {}
user_bonuses = {}
orders = []

def get_cart(user_id):
    return user_carts.get(user_id, [])

def add_to_cart(user_id, product_id):
    if user_id not in user_carts:
        user_carts[user_id] = []
    
    for item in user_carts[user_id]:
        if item["id"] == product_id:
            item["qty"] += 1
            return
    
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if product:
        user_carts[user_id].append({"id": product_id, "qty": 1, **product})

def remove_from_cart(user_id, product_id):
    if user_id in user_carts:
        user_carts[user_id] = [i for i in user_carts[user_id] if i["id"] != product_id]

def clear_cart(user_id):
    user_carts[user_id] = []

def get_cart_total(user_id):
    cart = get_cart(user_id)
    return sum(item["price"] * item["qty"] for item in cart)

# ============ KEYBOARDS ============

def main_reply_keyboard():
    keyboard = [
        [KeyboardButton("🛒 Каталог"), KeyboardButton("📦 Кошик")],
        [KeyboardButton("👤 Профіль"), KeyboardButton("❓ Допомога")]
    ]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

def main_menu_keyboard():
    keyboard = [
        [InlineKeyboardButton("🛒 Каталог", callback_data="catalog")],
        [InlineKeyboardButton("📦 Кошик", callback_data="cart"),
         InlineKeyboardButton("👤 Профіль", callback_data="profile")],
        [InlineKeyboardButton("🌐 Відкрити сайт", web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton("❓ Допомога", callback_data="help"),
         InlineKeyboardButton("💬 Підтримка", callback_data="support")]
    ]
    return InlineKeyboardMarkup(keyboard)

def categories_keyboard():
    keyboard = []
    for cat_id, cat_name in CATEGORIES.items():
        keyboard.append([InlineKeyboardButton(cat_name, callback_data=f"cat_{cat_id}")])
    keyboard.append([InlineKeyboardButton("🏠 Головне меню", callback_data="menu")])
    return InlineKeyboardMarkup(keyboard)

def products_keyboard(category="all", page=0, per_page=3):
    if category == "all":
        products = PRODUCTS
    else:
        products = [p for p in PRODUCTS if p["category"] == category]
    
    total_pages = (len(products) - 1) // per_page + 1 if products else 1
    start = page * per_page
    end = start + per_page
    page_products = products[start:end]
    
    keyboard = []
    for p in page_products:
        price_text = f"{p['price']}₴"
        if p.get('old_price'):
            price_text = f"~{p['old_price']}~ {p['price']}₴"
        keyboard.append([InlineKeyboardButton(
            f"{p['emoji']} {p['name']} - {price_text}",
            callback_data=f"prod_{p['id']}"
        )])
    
    nav_row = []
    if page > 0:
        nav_row.append(InlineKeyboardButton("⬅️", callback_data=f"page_{category}_{page-1}"))
    nav_row.append(InlineKeyboardButton(f"{page+1}/{total_pages}", callback_data="noop"))
    if page < total_pages - 1:
        nav_row.append(InlineKeyboardButton("➡️", callback_data=f"page_{category}_{page+1}"))
    
    if nav_row:
        keyboard.append(nav_row)
    
    keyboard.append([InlineKeyboardButton("🔙 Категорії", callback_data="catalog")])
    keyboard.append([InlineKeyboardButton("🏠 Меню", callback_data="menu")])
    
    return InlineKeyboardMarkup(keyboard)

def product_keyboard(product_id):
    keyboard = [
        [InlineKeyboardButton("🛒 Додати в кошик", callback_data=f"add_{product_id}")],
        [InlineKeyboardButton("🔙 Назад", callback_data="catalog"),
         InlineKeyboardButton("📦 Кошик", callback_data="cart")]
    ]
    return InlineKeyboardMarkup(keyboard)

def cart_keyboard(user_id):
    cart = get_cart(user_id)
    keyboard = []
    
    for item in cart:
        keyboard.append([
            InlineKeyboardButton(f"❌ {item['name']}", callback_data=f"remove_{item['id']}")
        ])
    
    if cart:
        keyboard.append([InlineKeyboardButton("💳 Оформити замовлення", callback_data="checkout")])
        keyboard.append([InlineKeyboardButton("🗑 Очистити кошик", callback_data="clear_cart")])
    
    keyboard.append([InlineKeyboardButton("🛒 Продовжити покупки", callback_data="catalog")])
    keyboard.append([InlineKeyboardButton("🏠 Меню", callback_data="menu")])
    
    return InlineKeyboardMarkup(keyboard)

def back_to_menu_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🏠 Головне меню", callback_data="menu")]
    ])

# ============ HANDLERS ============

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    
    text = (
        f"☁️ *Вітаємо, {user.first_name}!*\n\n"
        "🌿 *JahCloud* — преміум HHC одноразки\n\n"
        "⭐ Оплата через Telegram Stars\n"
        "🎁 5% кешбек бонусами\n"
        "🚀 Доставка 1-3 дні\n"
        "📦 Безкоштовно від 1000₴\n\n"
        "Оберіть опцію нижче 👇"
    )
    
    await update.message.reply_text(
        text,
        parse_mode='Markdown',
        reply_markup=main_reply_keyboard()
    )
    
    await update.message.reply_text(
        "🔽 *Головне меню*",
        parse_mode='Markdown',
        reply_markup=main_menu_keyboard()
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    user_id = update.effective_user.id
    
    if text == "🛒 Каталог":
        await show_categories(update, context)
    elif text == "📦 Кошик":
        await show_cart_message(update, context, user_id)
    elif text == "👤 Профіль":
        await show_profile(update, context, user_id)
    elif text == "❓ Допомога":
        await show_help(update, context)
    else:
        await update.message.reply_text(
            "Оберіть опцію з меню 👇",
            reply_markup=main_menu_keyboard()
        )

async def show_categories(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = "🛒 *Каталог*\n\nОберіть категорію:"
    
    if update.callback_query:
        await update.callback_query.edit_message_text(
            text, parse_mode='Markdown', reply_markup=categories_keyboard()
        )
    else:
        await update.message.reply_text(
            text, parse_mode='Markdown', reply_markup=categories_keyboard()
        )

async def show_products(update: Update, context: ContextTypes.DEFAULT_TYPE, category="all", page=0):
    query = update.callback_query
    
    cat_name = CATEGORIES.get(category, "Всі товари")
    
    if category == "all":
        products = PRODUCTS
    else:
        products = [p for p in PRODUCTS if p["category"] == category]
    
    text = f"*{cat_name}*\n\nТоварів: {len(products)}\nОберіть товар:"
    
    await query.edit_message_text(
        text,
        parse_mode='Markdown',
        reply_markup=products_keyboard(category, page)
    )

async def show_product(update: Update, context: ContextTypes.DEFAULT_TYPE, product_id: int):
    query = update.callback_query
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    
    if not product:
        await query.answer("Товар не знайдено")
        return
    
    price_text = f"*{product['price']}₴*"
    if product.get('old_price'):
        price_text = f"~{product['old_price']}₴~ *{product['price']}₴*"
    
    text = (
        f"{product['emoji']} *{product['name']}*\n\n"
        f"💰 Ціна: {price_text}\n"
        f"💨 Затяжок: {product['puffs']}\n\n"
        f"📝 {product['desc']}"
    )
    
    await query.edit_message_text(
        text,
        parse_mode='Markdown',
        reply_markup=product_keyboard(product_id)
    )

async def show_cart_message(update: Update, context: ContextTypes.DEFAULT_TYPE, user_id: int):
    cart = get_cart(user_id)
    
    if not cart:
        text = "📦 *Ваш кошик порожній*\n\nДодайте товари з каталогу!"
    else:
        text = "📦 *Ваш кошик:*\n\n"
        total = 0
        for item in cart:
            item_total = item['price'] * item['qty']
            total += item_total
            text += f"{item['emoji']} {item['name']} x{item['qty']} = {item_total}₴\n"
        text += f"\n💰 *Разом: {total}₴*"
        
        bonus = int(total * 0.05)
        text += f"\n🎁 Бонуси: +{bonus}"
    
    if update.callback_query:
        await update.callback_query.edit_message_text(
            text, parse_mode='Markdown', reply_markup=cart_keyboard(user_id)
        )
    else:
        await update.message.reply_text(
            text, parse_mode='Markdown', reply_markup=cart_keyboard(user_id)
        )

async def show_profile(update: Update, context: ContextTypes.DEFAULT_TYPE, user_id: int):
    bonuses = user_bonuses.get(user_id, 0)
    orders_count = len([o for o in orders if o.get("user_id") == user_id])
    
    text = (
        f"👤 *Ваш профіль*\n\n"
        f"🎁 Бонуси: *{bonuses}*\n"
        f"📦 Замовлень: *{orders_count}*\n\n"
        f"💡 Отримуйте 5% кешбек з кожної покупки!"
    )
    
    keyboard = [
        [InlineKeyboardButton("📦 Мої замовлення", callback_data="my_orders")],
        [InlineKeyboardButton("🎁 Використати бонуси", callback_data="use_bonuses")],
        [InlineKeyboardButton("🏠 Меню", callback_data="menu")]
    ]
    
    if update.callback_query:
        await update.callback_query.edit_message_text(
            text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard)
        )
    else:
        await update.message.reply_text(
            text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard)
        )

async def show_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "❓ *Допомога*\n\n"
        "*Команди:*\n"
        "/start - Головне меню\n"
        "/catalog - Каталог товарів\n"
        "/cart - Мій кошик\n"
        "/profile - Мій профіль\n\n"
        "*FAQ:*\n"
        "• Оплата через Telegram Stars ⭐\n"
        "• Доставка 1-3 дні (Нова Пошта)\n"
        "• Безкоштовна доставка від 1000₴\n"
        "• 5% кешбек бонусами\n\n"
        "*Промокоди:*\n"
        "JAHCLOUD10 - 10% знижки\n"
        "WELCOME - 50₴ знижки"
    )
    
    if update.callback_query:
        await update.callback_query.edit_message_text(
            text, parse_mode='Markdown', reply_markup=back_to_menu_keyboard()
        )
    else:
        await update.message.reply_text(
            text, parse_mode='Markdown', reply_markup=back_to_menu_keyboard()
        )

async def show_checkout(update: Update, context: ContextTypes.DEFAULT_TYPE, user_id: int):
    query = update.callback_query
    cart = get_cart(user_id)
    
    if not cart:
        await query.answer("Кошик порожній!")
        return
    
    total = get_cart_total(user_id)
    stars = max(1, total // 2)
    
    text = (
        "💳 *Оформлення замовлення*\n\n"
        f"💰 Сума: *{total}₴*\n"
        f"⭐ До оплати: *{stars} Stars*\n\n"
        "Натисніть кнопку нижче для оплати:"
    )
    
    keyboard = [
        [InlineKeyboardButton("⭐ Оплатити Stars", callback_data=f"pay_{total}")],
        [InlineKeyboardButton("🔙 Назад до кошика", callback_data="cart")]
    ]
    
    await query.edit_message_text(
        text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard)
    )

# ============ CALLBACK HANDLER ============

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    data = query.data
    user_id = update.effective_user.id
    
    if data == "menu":
        await query.edit_message_text(
            "🔽 *Головне меню*",
            parse_mode='Markdown',
            reply_markup=main_menu_keyboard()
        )
    
    elif data == "catalog":
        await show_categories(update, context)
    
    elif data.startswith("cat_"):
        category = data[4:]
        await show_products(update, context, category, 0)
    
    elif data.startswith("page_"):
        parts = data.split("_")
        category = parts[1]
        page = int(parts[2])
        await show_products(update, context, category, page)
    
    elif data.startswith("prod_"):
        product_id = int(data[5:])
        await show_product(update, context, product_id)
    
    elif data.startswith("add_"):
        product_id = int(data[4:])
        add_to_cart(user_id, product_id)
        product = next((p for p in PRODUCTS if p["id"] == product_id), None)
        await query.answer(f"✅ {product['name']} додано!")
        await show_cart_message(update, context, user_id)
    
    elif data.startswith("remove_"):
        product_id = int(data[7:])
        remove_from_cart(user_id, product_id)
        await query.answer("❌ Видалено")
        await show_cart_message(update, context, user_id)
    
    elif data == "cart":
        await show_cart_message(update, context, user_id)
    
    elif data == "clear_cart":
        clear_cart(user_id)
        await query.answer("🗑 Кошик очищено")
        await show_cart_message(update, context, user_id)
    
    elif data == "checkout":
        await show_checkout(update, context, user_id)
    
    elif data.startswith("pay_"):
        amount = int(data[4:])
        stars = max(1, amount // 2)
        
        cart = get_cart(user_id)
        items = ", ".join([f"{i['name']} x{i['qty']}" for i in cart])
        
        await context.bot.send_invoice(
            chat_id=update.effective_chat.id,
            title="JahCloud - Замовлення",
            description=items[:200],
            payload=f"order_{user_id}_{amount}",
            provider_token=PROVIDER_TOKEN,
            currency="XTR",
            prices=[LabeledPrice(label="Замовлення", amount=stars)]
        )
    
    elif data == "profile":
        await show_profile(update, context, user_id)
    
    elif data == "my_orders":
        user_orders = [o for o in orders if o.get("user_id") == user_id]
        if not user_orders:
            text = "📦 *Мої замовлення*\n\nУ вас поки немає замовлень."
        else:
            text = "📦 *Мої замовлення*\n\n"
            for o in user_orders[-5:]:
                text += f"#{o['id']} - {o['total']}₴ - {o['status']}\n"
        
        await query.edit_message_text(
            text, parse_mode='Markdown', reply_markup=back_to_menu_keyboard()
        )
    
    elif data == "help":
        await show_help(update, context)
    
    elif data == "support":
        text = (
            "💬 *Підтримка*\n\n"
            "Напишіть ваше питання, і наш менеджер відповість найближчим часом.\n\n"
            "📞 Графік: 10:00 - 22:00\n"
            "📱 Telegram: @jahcloud_support"
        )
        await query.edit_message_text(
            text, parse_mode='Markdown', reply_markup=back_to_menu_keyboard()
        )
    
    elif data == "noop":
        pass

# ============ PAYMENTS ============

async def precheckout_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.pre_checkout_query
    await query.answer(ok=True)

async def successful_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    payment = update.message.successful_payment
    user_id = update.effective_user.id
    
    # Parse payload
    parts = payment.invoice_payload.split("_")
    amount = int(parts[2]) if len(parts) > 2 else 0
    
    # Add bonuses
    bonus = int(amount * 0.05)
    user_bonuses[user_id] = user_bonuses.get(user_id, 0) + bonus
    
    # Create order
    order = {
        "id": len(orders) + 1,
        "user_id": user_id,
        "total": amount,
        "stars": payment.total_amount,
        "status": "new",
        "items": get_cart(user_id).copy()
    }
    orders.append(order)
    
    # Clear cart
    clear_cart(user_id)
    
    # Notify user
    await update.message.reply_text(
        f"✅ *Оплата успішна!*\n\n"
        f"📦 Замовлення #{order['id']}\n"
        f"💰 Сума: {amount}₴\n"
        f"⭐ Оплачено: {payment.total_amount} Stars\n"
        f"🎁 Бонуси: +{bonus}\n\n"
        f"Ми зв'яжемося з вами для підтвердження!",
        parse_mode='Markdown',
        reply_markup=main_menu_keyboard()
    )
    
    # Notify admin
    if ADMIN_ID:
        await context.bot.send_message(
            chat_id=ADMIN_ID,
            text=f"🔔 *Нове замовлення #{order['id']}*\n\n"
                 f"Користувач: {user_id}\n"
                 f"Сума: {amount}₴\n"
                 f"Stars: {payment.total_amount}",
            parse_mode='Markdown'
        )

# ============ COMMANDS ============

async def catalog_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await show_categories(update, context)

async def cart_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await show_cart_message(update, context, update.effective_user.id)

async def profile_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await show_profile(update, context, update.effective_user.id)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await show_help(update, context)

# ============ MAIN ============

def main():
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Commands
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("catalog", catalog_command))
    application.add_handler(CommandHandler("cart", cart_command))
    application.add_handler(CommandHandler("profile", profile_command))
    application.add_handler(CommandHandler("help", help_command))
    
    # Callbacks
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Messages
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Payments
    application.add_handler(PreCheckoutQueryHandler(precheckout_callback))
    application.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment))
    
    print("JahCloud Bot v2.0 started!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
