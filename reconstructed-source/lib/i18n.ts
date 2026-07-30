import { DEFAULT_LANGUAGE, type Language } from "./constants";

const en = {
  common: {
    bottle: "Bottle",
    bottles: "Bottles",
    loading: "Loading...",
    skinCare: "Skin Care",
    hairCare: "Hair Care",
    preOrder: "Pre-order",
    add: "Add",
    added: "Added",
    view: "View",
    secure: "Secure",
  },
  orderBump: {
    title: "Add to your order",
  },
  cart: {
    yourOrder: "Your Order",
    empty: "Your cart is empty",
    browseProducts: "Browse Products",
    continueShopping: "Continue Shopping",
    continueToCheckout: "Continue to Checkout",
    subtotal: "Subtotal",
    delivery: "Delivery",
    free: "FREE",
    total: "Total",
    added: "Added!",
    addToCart: "Add to Cart",
    prepaidPromo: "FREE delivery + discount on prepaid",
    freeShippingUnlocked: "🎉 You've unlocked FREE delivery!",
    freeShippingAddMore: "Add PKR {amount} more for FREE delivery!",
    saving: "You're saving PKR {amount}!",
    youSave: "You save",
    discount: "Discount",
  },
  footer: {
    copyright: "© {year} UpDerma. All rights reserved.",
    whatsapp: "WhatsApp",
  },
  checkout: {
    title: "Checkout",
    backToShop: "Back to shop",
    tryAgainError: "Please try again",
    failedOrderError: "Failed to place order",
    networkError: "Network error — please try again",
    form: {
      fullName: "Full Name",
      fullNamePlaceholder: "Enter your full name",
      phone: "Phone (WhatsApp)",
      phonePlaceholder: "03XX-XXXXXXX",
      email: "Email",
      emailPlaceholder: "your@email.com",
      optional: "optional",
      addEmail: "Add email for order updates",
      city: "City",
      cityPlaceholder: "Select your city",
      address: "Full Address",
      addressPlaceholder: "House #, Street, Area, Landmark",
    },
    summary: {
      title: "Your Order",
      subtotal: "Subtotal",
      delivery: "Delivery",
      free: "FREE",
      total: "TOTAL",
    },
    haveDiscountCode: "Have a discount code?",
    enterCode: "Enter code",
    apply: "Apply",
    invalidCoupon: "Invalid coupon",
    failedValidateCoupon: "Failed to validate coupon",
    deliveryDetails: "Delivery Details",
    payment: "Payment",
    codVerificationText:
      "I confirm I will be available to receive and pay for this order. We may verify the order on WhatsApp before dispatch.",
    freeDeliveryText: "FREE Delivery",
    offText: "OFF",
    urgencyText:
      "Small-batch availability: prepaid orders are reserved first. COD stock is reserved after verification.",
    trustStrip: {
      guarantee: "90-day money-back guarantee",
      delivery: "Pakistan-wide delivery",
    },
    validation: {
      name: "Please enter your full name",
      phone: "Enter a valid phone number (03XX-XXXXXXX)",
      email: "Please enter a valid email",
      city: "Please select your city",
      address: "Enter complete address (House #, Street, Area)",
      codConfirmed: "Please confirm you will accept delivery",
    },
    placingOrder: "Placing order...",
    confirmOrder: "Confirm Order",
    payNow: "Get Payment Details",
    codPrimaryBadge: "No advance payment",
    codReassuranceText: "Pay only after the parcel reaches you.",
    prepaidInstructionNotice:
      "Your order is saved first. Wallet or bank details appear after you place it, then we verify payment before dispatch.",
    prepaidDiscountText: "Prepaid discount ({percent}%)",
    prepaidDiscountLabel: "Prepaid discount",
    prepaidRecommended: "Recommended",
    prepaidPriorityNotice:
      "Prepaid orders receive free delivery, the available discount, and immediate stock reservation. COD stock is reserved after WhatsApp verification.",
    whatsappNotice: "Order confirmation will be sent via WhatsApp",
    policyLinksLabel: "Checkout policies",
    refundPolicy: "Refund Policy",
    privacyPolicy: "Privacy Policy",
    termsPolicy: "Terms",
    deliveryReturnsPolicy: "Delivery & Returns",
  },
  thankYou: {
    codTitle: "Order confirmed",
    prepaidTitle: "Order received",
    orderId: "Order ID",
    codGreeting: "Thank you. Your order #{orderId} is confirmed.",
    prepaidGreeting:
      "Thank you. Your order #{orderId} is saved. Complete payment to confirm dispatch.",
    missingOrder:
      "We could not load full order details here. If you selected wallet or bank payment, contact us on WhatsApp with your order ID.",
    whatNext: {
      title: "What's Next",
      items: [
        "Your order will be dispatched within 24 hours",
        "Expected delivery: 3-5 business days",
        "Confirmation email sent to {email}",
        "WhatsApp updates on {phone}",
      ],
      codItems: [
        "We may confirm this order on WhatsApp before dispatch.",
        "Keep the exact cash amount ready when the rider arrives.",
        "Delivery usually takes 3-5 business days.",
      ],
      prepaidItems: [
        "Your order is reserved while payment is pending.",
        "Send the exact amount to the account shown above.",
        "Share a screenshot so we can verify and dispatch.",
      ],
    },
    orderDetails: {
      title: "Your Order Details",
      payment: "Payment",
      total: "Total",
    },
    paymentInstructions: {
      title: "Complete payment to confirm dispatch",
      body:
        "Send exactly {amount} using the details below. After sending, share or upload a screenshot so our team can verify faster.",
      method: "Payment method",
      status: "Status",
      pending: "Payment pending",
      verified: "Payment verified",
      cod: "Pay on delivery",
      bankName: "Bank",
      accountTitle: "Account title",
      accountNumber: "Account number",
      whatsappButton: "Send screenshot on WhatsApp",
      noDetails:
        "Payment account details are not configured yet. Please contact support on WhatsApp with your order ID.",
    },
    proofUpload: {
      title: "Optional screenshot upload",
      help:
        "You can upload the payment screenshot here, or send it on WhatsApp.",
      uploaded:
        "Screenshot received. Our team will verify it before dispatch.",
      button: "Upload Screenshot",
      uploading: "Uploading...",
      error: "Could not upload screenshot",
    },
    codSafety: {
      title: "No advance payment needed",
      body:
        "Keep {amount} ready for delivery. We may confirm on WhatsApp at {phone} before dispatch so the parcel reaches the right person.",
    },
  },
  product: {
    guarantees: {
      nationwide: "Nationwide COD",
      resultsSeen: "Customer Reviewed",
      dermApproved: "Dermatologist Reviewed",
      moneyBack: "90-Day Money-Back Guarantee",
    },
  },
  productsCatalog: {
    metaTitle: "Products - UpDerma | Hair Care & Skin Care",
    metaDescription:
      "Browse UpDerma's hair care and skin care range with research-backed formulas, clear package options, and practical routines for modern life in Pakistan.",
    categoryLabels: {
      all: "All Products",
      hair_care: "Hair Care",
      skin_care: "Skin Care",
    },
    defaultHeroTitle:
      "Premium hair and skin care, chosen with more confidence",
    defaultHeroDescription:
      "Browse research-backed formulas, compare package options clearly, and choose a routine that fits your concern, lifestyle, and standards.",
    trustRating: "Customer Reviewed",
    trustGuarantee: "90-Day Money-Back Guarantee",
    trustDelivery: "Free Delivery PKR 5,000+",
    shopByConcern: "Shop by concern",
    needHelpChoosing: "Need help choosing? Ask on WhatsApp",
    resultsCountSingle: "product",
    resultsCountPlural: "products",
    socialProof: [
      "Research-Backed",
      "Dermatologist Reviewed",
      "Customer Reviewed",
    ],
    concerns: {
      hair_fall: {
        label: "Hair fall",
        title: "Shop hair care for shedding and weaker roots",
        description:
          "Start with formulas designed to support reduced shedding, a healthier scalp routine, and stronger-looking hair over time.",
      },
      thinning: {
        label: "Thinning",
        title: "Shop hair care for thinning and slower growth",
        description:
          "Browse routines built for thinner-looking hair, slower regrowth, and daily support that is easy to stay consistent with.",
      },
      dull_skin: {
        label: "Dull skin",
        title: "Shop skin care for dullness and tired-looking skin",
        description:
          "Explore formulas made to help skin look brighter, fresher, and more even without overcomplicating your daily routine.",
      },
      texture: {
        label: "Texture",
        title: "Shop skin care for texture and smoother daily maintenance",
        description:
          "Find products built to support a smoother-looking feel, easier daily care, and a more polished skin routine.",
      },
    },
  },
  homepage: {
    storefront: {
      eyebrow: "Focused routines. Clear starting point.",
      headline: "Choose the UpDerma formula that fits your main concern.",
      subtitle:
        "Hair fall, hydration, daily glow, or night renewal. Start with the concern you want to change now, then build the routine only if you need it.",
      concernPrompt: "Find my match",
      primaryCta: "Find My Match",
      stickyCta: "Find Match",
      secondaryCta: "Compare Products",
      exploreHair: "Explore Bio-Activin Oil",
      exploreSkin: "Explore Rice Glow Cream",
      categoryTitle: "The complete UpDerma edit",
      categorySubtitle:
        "Clear routines for scalp support, hydration, daily glow, and night renewal, without making skincare feel complicated.",
      concernsEyebrow: "Choose by concern",
      concernsTitle: "What do you want to improve first?",
      concernsSubtitle:
        "Pick the concern that brought you here. We will show the simplest starting point before the full catalogue.",
      categoryHairTitle: "Bio-Activin Hair Growth Oil",
      categoryHairBody:
        "Caffeine-powered oil for weaker roots, shedding, and a scalp routine you can stay consistent with.",
      categorySkinTitle: "Rice + Glass Skin Routine",
      categorySkinBody:
        "Layer Glass Glow Serum, Rice Glow Cream, and Rice Renew Cream for day-to-night skin care.",
      proofEyebrow: "Start with confidence",
      proofQuote:
        "Start with a clear recommendation, customer-reported experiences, dermatologist review, COD, and a 90-day money-back guarantee.",
      proofFootnote:
        "Based on customer-reported routine use; individual results vary.",
      bestsellersEyebrow: "Routine picker",
      bestsellersTitle: "Match your concern to the right formula",
      bestsellersBody:
        "Each formula has one clear job. Pick the concern that matters most today; keep the rest for when your routine needs it.",
      productCta: "Details",
      resultsTitle: "What verified buyers noticed",
      resultsSubtitle: "Verified routine feedback",
      researchEyebrow: "Why the range stays focused",
      researchTitle: "Focused formulas with clear routine jobs.",
      researchBody:
        "The range is intentionally small so you can match one formula to one need instead of decoding a crowded shelf.",
      researchCards: [
        "Scalp and root support",
        "Hydration and daily glow",
        "Night renewal and texture",
      ],
      consultEyebrow: "Need help choosing?",
      consultTitle: "Want a recommendation instead?",
      consultBody:
        "Message us your main concern and we will point you to the formula that fits before you build a routine.",
      consultPrimary: "Ask on WhatsApp",
      consultSecondary:
        "Tell us your concern. We will recommend the best starting point for your routine.",
      guidanceEyebrow: "Routine logic",
      guidanceTitle: "Build around the moment you will actually use it",
      guidanceBody:
        "Choose the concern first, then place the formula where it naturally fits: scalp nights, hydration layer, morning glow, or night renewal.",
      finalTitle: "Ready to choose your starting point?",
      finalBody:
        "Pick the concern you want to improve now. You can add the next product later.",
      finalPrimary: "Find My Match",
      finalSecondary: "Compare Products",
      trustRatingLabel: "Customer-reported results",
      trustDeliveryLabel: "Expert trust",
      trustPaymentLabel: "Payment option",
      trustSupportLabel: "Guarantee",
      trustRatingValue: "Verified",
      trustDeliveryValue: "Dermatologist",
      trustPaymentValue: "COD",
      trustSupportValue: "90 days",
      formulaBadges: [
        "Clear routine steps",
        "Product pages",
        "Pakistan delivery",
      ],
      concernLinks: ["Hair fall", "Hydration", "Morning glow", "Night repair"],
      reassurancePoints: [
        "Customer-reviewed routines",
        "Dermatologist reviewed",
        "COD and prepaid options",
      ],
      productGuide: {
        "hair-growth-oil": {
          routineLabel: "Scalp + root support",
          usageLabel: "3-4 nights weekly",
          bestForLabel: "Hair fall",
          decisionLabel:
            "Start here if shedding, weak roots, or slower growth is the concern you notice most.",
        },
        "glass-glow-serum": {
          routineLabel: "Hydration layer",
          usageLabel: "AM/PM serum",
          bestForLabel: "Hydration",
          decisionLabel:
            "Start here if your skin feels dull or dehydrated and you want a lighter daily layer.",
        },
        "rice-glow-cream": {
          routineLabel: "Morning glow cream",
          usageLabel: "Daytime step",
          bestForLabel: "Morning glow",
          decisionLabel:
            "Start here if you want a brighter daytime finish without adding many steps.",
        },
        "rice-renew-cream": {
          routineLabel: "Night renewal cream",
          usageLabel: "Night step",
          bestForLabel: "Night repair",
          decisionLabel:
            "Start here if texture, fine lines, or firmness are the concern you want to work on at night.",
        },
      },
      guidanceCards: [
        {
          title: "Morning glow step",
          body:
            "Use Glass Glow Serum for hydration, then Rice Glow Cream when you want a brighter daytime finish.",
        },
        {
          title: "Night renewal step",
          body:
            "Use Rice Renew Cream at night for retinol-led texture, fine-line, and firmness support.",
        },
        {
          title: "Scalp support step",
          body:
            "Use Bio-Activin Hair Growth Oil consistently when shedding, roots, or slower growth are the main concern.",
        },
      ],
      closingPoints: [
        "Customer-reviewed routines",
        "Dermatologist reviewed",
        "90-day money-back guarantee",
      ],
    },
  },
};

const ur: typeof en = {
  common: {
    bottle: "بوتل",
    bottles: "بوتلیں",
    loading: "لوڈ ہو رہا ہے...",
    skinCare: "سکن کیئر",
    hairCare: "ہیئر کیئر",
    preOrder: "پری آرڈر",
    add: "شامل کریں",
    added: "شامل ہو گیا",
    view: "دیکھیں",
    secure: "محفوظ",
  },
  orderBump: {
    title: "اپنے آرڈر میں شامل کریں",
  },
  cart: {
    yourOrder: "آپ کا آرڈر",
    empty: "آپ کا کارٹ خالی ہے",
    browseProducts: "مصنوعات دیکھیں",
    continueShopping: "خریداری جاری رکھیں",
    continueToCheckout: "چیک آؤٹ پر جائیں",
    subtotal: "سب ٹوٹل",
    delivery: "ڈیلیوری",
    free: "مفت",
    total: "کل",
    added: "شامل ہو گیا!",
    addToCart: "کارٹ میں شامل کریں",
    prepaidPromo: "پری پیڈ ادائیگی پر مفت ڈیلیوری + ڈسکاؤنٹ",
    freeShippingUnlocked: "🎉 آپ نے مفت ڈیلیوری حاصل کر لی!",
    freeShippingAddMore: "مفت ڈیلیوری کے لیے مزید PKR {amount} شامل کریں",
    saving: "آپ PKR {amount} بچا رہے ہیں!",
    youSave: "آپ بچا رہے ہیں",
    discount: "ڈسکاؤنٹ",
  },
  footer: {
    copyright: "© {year} UpDerma۔ جملہ حقوق محفوظ ہیں۔",
    whatsapp: "واٹس ایپ",
  },
  checkout: {
    title: "چیک آؤٹ",
    backToShop: "دکان پر واپس جائیں",
    tryAgainError: "براہ کرم دوبارہ کوشش کریں",
    failedOrderError: "آرڈر میں مسئلہ ہوا",
    networkError: "نیٹ ورک مسئلہ — دوبارہ کوشش کریں",
    form: {
      fullName: "پورا نام",
      fullNamePlaceholder: "اپنا پورا نام لکھیں",
      phone: "فون (واٹس ایپ)",
      phonePlaceholder: "03XX-XXXXXXX",
      email: "ای میل",
      emailPlaceholder: "your@email.com",
      optional: "اختیاری",
      addEmail: "آرڈر اپڈیٹس کے لیے ای میل شامل کریں",
      city: "شہر",
      cityPlaceholder: "اپنا شہر منتخب کریں",
      address: "مکمل پتہ",
      addressPlaceholder: "مکان نمبر، گلی، علاقہ، نشانی",
    },
    summary: {
      title: "آپ کا آرڈر",
      subtotal: "سب ٹوٹل",
      delivery: "ڈیلیوری",
      free: "مفت",
      total: "کل",
    },
    haveDiscountCode: "ڈسکاؤنٹ کوڈ ہے؟",
    enterCode: "کوڈ درج کریں",
    apply: "لگائیں",
    invalidCoupon: "غلط کوپن",
    failedValidateCoupon: "کوپن کی تصدیق ناکام",
    deliveryDetails: "ڈیلیوری کی تفصیلات",
    payment: "ادائیگی",
    codVerificationText:
      "میں تصدیق کرتا/کرتی ہوں کہ میں یہ آرڈر وصول کر کے ادائیگی کروں گا/گی۔ روانگی سے پہلے آرڈر کی تصدیق واٹس ایپ پر کی جا سکتی ہے۔",
    freeDeliveryText: "مفت ڈیلیوری",
    offText: "چھوٹ",
    urgencyText:
      "محدود بیچ دستیاب ہے: پری پیڈ آرڈر پہلے محفوظ ہوتے ہیں۔ کیش آن ڈیلیوری اسٹاک تصدیق کے بعد محفوظ ہوتا ہے۔",
    trustStrip: {
      guarantee: "90 دن کی منی بیک گارنٹی",
      delivery: "پاکستان بھر میں ڈیلیوری",
    },
    validation: {
      name: "نام درج کریں (کم از کم 3 حروف)",
      phone: "درست فون نمبر درج کریں (03XX-XXXXXXX)",
      email: "درست ای میل درج کریں",
      city: "شہر منتخب کریں",
      address: "مکمل پتہ درج کریں (مکان نمبر، گلی، علاقہ)",
      codConfirmed: "براہ کرم آرڈر وصولی کی تصدیق کریں",
    },
    placingOrder: "آرڈر مکمل ہو رہا ہے...",
    confirmOrder: "آرڈر کی تصدیق کریں",
    payNow: "ادائیگی کی تفصیلات دیکھیں",
    codPrimaryBadge: "پہلے ادائیگی نہیں",
    codReassuranceText: "پارسل ملنے پر ہی ادائیگی کریں۔",
    prepaidInstructionNotice:
      "پہلے آرڈر محفوظ ہوگا۔ والیٹ یا بینک تفصیلات اگلی اسکرین پر نظر آئیں گی، پھر ڈسپیچ سے پہلے ادائیگی ویریفائی ہوگی۔",
    prepaidDiscountText: "پری پیڈ رعایت ({percent}%)",
    prepaidDiscountLabel: "پری پیڈ رعایت",
    prepaidRecommended: "تجویز کردہ",
    prepaidPriorityNotice:
      "پری پیڈ آرڈر پر مفت ڈیلیوری، دستیاب رعایت اور فوری اسٹاک ریزرویشن ملتی ہے۔ کیش آن ڈیلیوری اسٹاک واٹس ایپ تصدیق کے بعد محفوظ ہوتا ہے۔",
    whatsappNotice: "آرڈر کی تصدیق واٹس ایپ کے ذریعے بھیجی جائے گی",
    policyLinksLabel: "چیک آؤٹ پالیسیاں",
    refundPolicy: "ریفنڈ پالیسی",
    privacyPolicy: "پرائیویسی پالیسی",
    termsPolicy: "شرائط",
    deliveryReturnsPolicy: "ڈیلیوری اور واپسی",
  },
  thankYou: {
    codTitle: "آرڈر کنفرم ہو گیا",
    prepaidTitle: "آرڈر محفوظ ہو گیا",
    orderId: "آرڈر ID",
    codGreeting: "شکریہ۔ آپ کا آرڈر #{orderId} کنفرم ہو گیا۔",
    prepaidGreeting:
      "شکریہ۔ آپ کا آرڈر #{orderId} محفوظ ہو گیا ہے۔ ڈسپیچ کنفرم کرنے کے لیے ادائیگی مکمل کریں۔",
    missingOrder:
      "ہم یہاں مکمل آرڈر تفصیلات لوڈ نہیں کر سکے۔ اگر آپ نے والیٹ یا بینک ادائیگی منتخب کی ہے تو اپنے آرڈر ID کے ساتھ واٹس ایپ پر رابطہ کریں۔",
    whatNext: {
      title: "آگے کیا ہوگا",
      items: [
        "آپ کا آرڈر 24 گھنٹوں میں روانہ ہوگا",
        "متوقع ڈیلیوری: 3-5 کاروباری دن",
        "تصدیقی ای میل {email} پر بھیج دی گئی",
        "{phone} پر واٹس ایپ اپڈیٹس",
      ],
      codItems: [
        "ڈسپیچ سے پہلے ہم واٹس ایپ پر آرڈر کنفرم کر سکتے ہیں۔",
        "رائیڈر کے آنے پر درست کیش رقم تیار رکھیں۔",
        "ڈیلیوری عموماً 3-5 کاروباری دن میں ہوتی ہے۔",
      ],
      prepaidItems: [
        "ادائیگی ویریفائی ہونے تک آپ کا آرڈر محفوظ ہے۔",
        "اوپر دی گئی تفصیلات پر درست رقم بھیجیں۔",
        "اسکرین شاٹ شیئر کریں تاکہ ہم ویریفائی کر کے ڈسپیچ کر سکیں۔",
      ],
    },
    orderDetails: {
      title: "آپ کے آرڈر کی تفصیلات",
      payment: "ادائیگی",
      total: "کل",
    },
    paymentInstructions: {
      title: "ڈسپیچ کنفرم کرنے کے لیے ادائیگی مکمل کریں",
      body:
        "نیچے دی گئی تفصیلات پر بالکل {amount} بھیجیں۔ ادائیگی کے بعد اسکرین شاٹ شیئر یا اپلوڈ کریں تاکہ ہماری ٹیم جلدی ویریفائی کر سکے۔",
      method: "ادائیگی کا طریقہ",
      status: "اسٹیٹس",
      pending: "ادائیگی باقی ہے",
      verified: "ادائیگی ویریفائی ہو گئی",
      cod: "ڈیلیوری پر ادائیگی",
      bankName: "بینک",
      accountTitle: "اکاؤنٹ ٹائٹل",
      accountNumber: "اکاؤنٹ نمبر",
      whatsappButton: "واٹس ایپ پر اسکرین شاٹ بھیجیں",
      noDetails:
        "ادائیگی کی اکاؤنٹ تفصیلات ابھی سیٹ نہیں ہیں۔ اپنے آرڈر ID کے ساتھ واٹس ایپ سپورٹ سے رابطہ کریں۔",
    },
    proofUpload: {
      title: "اختیاری اسکرین شاٹ اپلوڈ",
      help:
        "آپ ادائیگی کا اسکرین شاٹ یہاں اپلوڈ کر سکتے ہیں، یا واٹس ایپ پر بھیج سکتے ہیں۔",
      uploaded:
        "اسکرین شاٹ موصول ہو گیا۔ ہماری ٹیم ڈسپیچ سے پہلے اسے ویریفائی کرے گی۔",
      button: "اسکرین شاٹ اپلوڈ کریں",
      uploading: "اپلوڈ ہو رہا ہے...",
      error: "اسکرین شاٹ اپلوڈ نہیں ہو سکا",
    },
    codSafety: {
      title: "پہلے ادائیگی کی ضرورت نہیں",
      body:
        "ڈیلیوری کے لیے {amount} تیار رکھیں۔ پارسل درست شخص تک پہنچانے کے لیے ہم ڈسپیچ سے پہلے {phone} پر واٹس ایپ تصدیق کر سکتے ہیں۔",
    },
  },
  product: {
    guarantees: {
      nationwide: "ملک بھر ڈیلیوری",
      resultsSeen: "کسٹمر ریویو شدہ",
      dermApproved: "ڈرماٹولوجسٹ ریویو شدہ",
      moneyBack: "90 دن کی منی بیک گارنٹی",
    },
  },
  productsCatalog: {
    ...en.productsCatalog,
    categoryLabels: {
      all: "تمام مصنوعات",
      hair_care: "بالوں کی دیکھ بھال",
      skin_care: "جلد کی دیکھ بھال",
    },
    defaultHeroTitle:
      "بالوں اور جلد کی نگہداشت، زیادہ اطمینان کے ساتھ منتخب کریں",
    defaultHeroDescription:
      "تحقیق پر مبنی فارمولاز دیکھیں، پیکیجز کا واضح موازنہ کریں، اور وہ روٹین منتخب کریں جو آپ کے مسئلے، طرزِ زندگی، اور معیار سے میل کھاتی ہو۔",
    trustRating: "کسٹمر ریویو شدہ",
    trustGuarantee: "90 دن کی منی بیک گارنٹی",
    trustDelivery: "مفت ڈیلیوری PKR 5,000+",
    shopByConcern: "شاپ بائے کنسرن",
    needHelpChoosing: "انتخاب میں مدد چاہیے؟ واٹس ایپ کریں",
    resultsCountSingle: "پراڈکٹ",
    resultsCountPlural: "مصنوعات",
    socialProof: ["تحقیق پر مبنی", "ڈرماٹولوجسٹ ریویو شدہ", "کسٹمر ریویو شدہ"],
    concerns: {
      hair_fall: {
        label: "ہیئر فال",
        title: "بال گرنے اور کمزور جڑوں کے لیے ہیئر کیئر خریدیں",
        description:
          "ایسے فارمولاز سے آغاز کریں جو بال گرنے میں کمی، بہتر کھوپڑی روٹین، اور وقت کے ساتھ مضبوط نظر آنے والے بالوں میں مدد دیں۔",
      },
      thinning: {
        label: "پتلے بال",
        title: "پتلے بالوں اور سست گروتھ کے لیے ہیئر کیئر خریدیں",
        description:
          "ایسی روٹینز دیکھیں جو پتلے دکھنے والے بالوں، سست ریگروتھ، اور روزانہ استعمال میں آسان سپورٹ کے لیے بنائی گئی ہیں۔",
      },
      dull_skin: {
        label: "ڈل سکن",
        title: "ڈلنیس اور تھکی ہوئی جلد کے لیے اسکن کیئر خریدیں",
        description:
          "ایسے فارمولاز دیکھیں جو جلد کو زیادہ روشن، تازہ، اور نسبتاً یکساں دکھانے میں مدد دیں، بغیر روزانہ روٹین کو پیچیدہ بنائے۔",
      },
      texture: {
        label: "ٹیکسچر",
        title: "ٹیکسچر اور زیادہ ہموار جلد کے لیے اسکن کیئر خریدیں",
        description:
          "ایسے پراڈکٹس منتخب کریں جو جلد کو زیادہ ہموار محسوس کرانے، آسان روزانہ نگہداشت، اور بہتر اسکن روٹین میں مدد کریں۔",
      },
    },
  },
  homepage: {
    storefront: {
      ...en.homepage.storefront,
      eyebrow: "واضح روٹینز۔ آسان شروعات۔",
      headline: "اپنے اصل مسئلے کے لیے UpDerma کا درست فارمولا چنیں۔",
      subtitle:
        "بال گرنا، نمی، روزانہ نکھار، یا رات کی مرمت۔ پہلے وہ مسئلہ چنیں جسے آپ ابھی بہتر کرنا چاہتے ہیں، باقی روٹین بعد میں بن سکتی ہے۔",
      concernPrompt: "میرا میچ تلاش کریں",
      primaryCta: "میرا میچ تلاش کریں",
      stickyCta: "میچ تلاش کریں",
      secondaryCta: "پراڈکٹس کا موازنہ کریں",
      proofEyebrow: "اعتماد کے ساتھ شروع کریں",
      proofQuote:
        "واضح سفارش، کسٹمر تجربات، ڈرماٹولوجسٹ ریویو، COD، اور 90 دن کی منی بیک گارنٹی کے ساتھ شروع کریں۔",
      proofFootnote:
        "کسٹمر رپورٹڈ روٹین استعمال کی بنیاد پر؛ نتائج ہر فرد میں مختلف ہو سکتے ہیں۔",
      bestsellersEyebrow: "روٹین چننے میں مدد",
      bestsellersTitle: "اپنے مسئلے کو درست فارمولے سے ملائیں",
      bestsellersBody:
        "ہر فارمولے کا ایک واضح کام ہے۔ آج جو مسئلہ سب سے اہم ہے اسے چنیں؛ باقی روٹین ضرورت کے وقت شامل کریں۔",
      productCta: "تفصیل",
      resultsTitle: "تصدیق شدہ خریداروں نے کیا محسوس کیا",
      resultsSubtitle: "تصدیق شدہ روٹین فیڈبیک",
      consultEyebrow: "انتخاب میں مدد چاہیے؟",
      consultTitle: "سفارش چاہیے؟",
      consultBody:
        "اپنا اصل مسئلہ میسج کریں، ہم روٹین بنانے سے پہلے آپ کے لیے موزوں فارمولا بتا دیں گے۔",
      consultPrimary: "واٹس ایپ پر پوچھیں",
      consultSecondary:
        "اپنا مسئلہ بتائیں۔ ہم آپ کی روٹین کے لیے بہترین شروعات تجویز کریں گے۔",
      guidanceEyebrow: "روٹین لاجک",
      guidanceTitle: "اس وقت کے حساب سے بنائیں جب آپ واقعی استعمال کریں گے",
      guidanceBody:
        "پہلے مسئلہ چنیں، پھر فارمولا اس جگہ رکھیں جہاں وہ فطری طور پر فٹ ہوتا ہے: رات کا اسکیلپ کیئر، نمی کی تہہ، صبح کا نکھار، یا رات کی مرمت۔",
      finalTitle: "اپنی شروعات چننے کے لیے تیار ہیں؟",
      finalBody:
        "وہ مسئلہ چنیں جسے آپ ابھی بہتر کرنا چاہتے ہیں۔ اگلی پراڈکٹ بعد میں شامل کی جا سکتی ہے۔",
      finalPrimary: "میرا میچ تلاش کریں",
      finalSecondary: "پراڈکٹس کا موازنہ کریں",
      closingPoints: [
        "کسٹمر ریویو شدہ روٹینز",
        "ڈرماٹولوجسٹ ریویو شدہ",
        "90 دن کی منی بیک گارنٹی",
      ],
    },
  },
};

export const translations = { en, ur };
export type Translations = typeof en;

export function t(
  key: string,
  lang: Language = DEFAULT_LANGUAGE,
): string | any {
  const keys = key.split(".");
  let value: any = translations[lang];
  for (const item of keys) {
    if (value && typeof value === "object" && item in value) value = value[item];
    else {
      if (lang !== "en") return t(key, "en");
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  return typeof value === "string" || Array.isArray(value) ? value : key;
}

export function getTranslations(
  lang: Language = DEFAULT_LANGUAGE,
): Translations {
  return translations[lang];
}

export function createT(lang: Language) {
  return (key: string) => t(key, lang);
}

export function getDirection(lang: Language): "ltr" | "rtl" {
  return lang === "ur" ? "rtl" : "ltr";
}

export function isRTL(lang: Language): boolean {
  return lang === "ur";
}

export function getBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;
  return navigator.language.toLowerCase().startsWith("ur") ? "ur" : "en";
}

export function interpolate(
  template: string,
  variables: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    variables[key] === undefined ? `{${key}}` : variables[key].toString(),
  );
}
