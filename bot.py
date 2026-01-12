# JahCloud Telegram Bot
# Бот для оплати через Telegram Stars

import os
import logging
from telegram import Update, LabeledPrice, InlineKeyboardButton, InlineKeyboardMarkup
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
PROVIDER_TOKEN = ""  # Empty for Telegram Stars
WEBAPP_URL = os.getenv('WEBAPP_URL', 'https://your-domain.com')

# ============ COMMANDS ============

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Стартове повідомлення"""
    keyboard = [
        [InlineKeyboardButton("🛒 Відкрити магазин", web_app={"url": WEBAPP_URL})],
        [InlineKeyboardButton("📦 Мої замовлення", callback_data="orders")],
        [InlineKeyboardButton("🎁 Мої бонуси", callback_data="bonuses")],
        [InlineKeyboardButton("💬 Підтримка", callback_data="support")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "☁️ *Вітаємо в JahCloud!*\n\n"
        "🌿 Преміум HHC одноразки з доставкою по Україні.\n\n"
        "⭐ Оплата через Telegram Stars\n"
        "🎁 5% кешбек з кожної покупки\n"
        "🚀 Відправка в день замовлення\n\n"
        "Оберіть опцію нижче 👇",
        parse_mode='Markdown',
        reply_markup=reply_markup
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Допомога"""
    await update.message.reply_text(
        "☁️ *JahCloud - Допомога*\n\n"
        "📋 *Команди:*\n"
        "/start - Головне меню\n"
        "/shop - Відкрити магазин\n"
        "/orders - Мої замовлення\n"
        "/bonuses - Мої бонуси\n"
        "/support - Написати підтримці\n\n"
        "❓ *FAQ:*\n"
        "• Оплата через Telegram Stars ⭐\n"
        "• Доставка 1-3 дні (Нова Пошта)\n"
        "• Безкоштовна доставка від 1000₴\n"
        "• 5% кешбек бонусами",
        parse_mode='Markdown'
    )

async def shop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Відкрити магазин"""
    keyboard = [[InlineKeyboardButton("🛒 Відкрити магазин", web_app={"url": WEBAPP_URL})]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "☁️ Натисніть кнопку нижче, щоб відкрити магазин:",
        reply_markup=reply_markup
    )

# ============ CALLBACKS ============

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обробка кнопок"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "orders":
        await query.edit_message_text(
            "📦 *Мої замовлення*\n\n"
            "У вас поки немає замовлень.\n"
            "Перейдіть в магазин, щоб зробити перше замовлення!",
            parse_mode='Markdown'
        )
    elif query.data == "bonuses":
        await query.edit_message_text(
            "🎁 *Мої бонуси*\n\n"
            "Ваш баланс: *0* бонусів\n\n"
            "Отримуйте 5% кешбек з кожної покупки!\n"
            "1 бонус = 1₴",
            parse_mode='Markdown'
        )
    elif query.data == "support":
        await query.edit_message_text(
            "💬 *Підтримка*\n\n"
            "Напишіть ваше питання, і наш менеджер відповість найближчим часом.\n\n"
            "Графік роботи: 10:00 - 22:00"
        )

# ============ PAYMENTS ============

async def create_invoice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Створення інвойсу для оплати Stars"""
    # Приклад: /pay 450 Purple Haze HHC
    args = context.args
    if len(args) < 2:
        await update.message.reply_text("Використання: /pay <сума> <назва товару>")
        return
    
    try:
        amount = int(args[0])
        title = ' '.join(args[1:])
    except ValueError:
        await update.message.reply_text("Невірний формат суми")
        return
    
    # Convert UAH to Stars (approximate)
    stars_amount = max(1, amount // 2)
    
    await context.bot.send_invoice(
        chat_id=update.effective_chat.id,
        title=f"JahCloud: {title}",
        description=f"Оплата замовлення в магазині JahCloud",
        payload=f"order_{update.effective_user.id}_{amount}",
        provider_token=PROVIDER_TOKEN,  # Empty for Stars
        currency="XTR",  # Telegram Stars
        prices=[LabeledPrice(label=title, amount=stars_amount)],
        start_parameter="start"
    )

async def precheckout_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Перевірка перед оплатою"""
    query = update.pre_checkout_query
    
    # Тут можна додати перевірку наявності товару
    
    await query.answer(ok=True)

async def successful_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Успішна оплата"""
    payment = update.message.successful_payment
    
    # Нарахування бонусів (5%)
    amount_uah = payment.total_amount * 2  # Приблизна конвертація
    bonuses = int(amount_uah * 0.05)
    
    await update.message.reply_text(
        f"✅ *Оплата успішна!*\n\n"
        f"Сума: {payment.total_amount} ⭐ Stars\n"
        f"Бонуси: +{bonuses} 🎁\n\n"
        f"Дякуємо за замовлення!\n"
        f"Ми зв'яжемося з вами найближчим часом для підтвердження.",
        parse_mode='Markdown'
    )
    
    # TODO: Зберегти замовлення в базу даних
    # TODO: Надіслати сповіщення адміну

# ============ MAIN ============

def main():
    """Запуск бота"""
    if BOT_TOKEN == 'YOUR_BOT_TOKEN_HERE':
        print("❌ Помилка: Вкажіть BOT_TOKEN в змінних середовища")
        print("   Отримайте токен у @BotFather")
        return
    
    # Створення додатку
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Команди
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("shop", shop))
    application.add_handler(CommandHandler("pay", create_invoice))
    
    # Callbacks
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Платежі
    application.add_handler(PreCheckoutQueryHandler(precheckout_callback))
    application.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment))
    
    # Запуск
    print("JahCloud Bot started!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
