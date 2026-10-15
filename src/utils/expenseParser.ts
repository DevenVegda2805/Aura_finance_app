import { Category, DetectedExpense, MerchantCategoryRule, PaymentMethod } from '../types/finance';

/**
 * Intelligent parser for UPI alerts, bank SMS notifications, and mobile payment receipts.
 * Automatically extracts:
 * - Amount
 * - Merchant / Payee
 * - Payment Method (PhonePe, Apple Pay, Google Pay, Paytm, etc.)
 * - Suggested Category based on keyword heuristics and learned user rules
 */
export function parseExpenseNotification(
  rawText: string,
  categories: Category[],
  rules: MerchantCategoryRule[] = []
): DetectedExpense | null {
  const text = rawText.trim();
  if (!text) return null;

  // 1. Amount Detection
  // Matches: Rs. 450, Rs 1,299.50, INR 85.00, ₹500, $45.20, €12.00, etc.
  const amountRegex =
    /(?:(?:rs\.?|inr|₹|\$|€|£)\s*([0-9,]+(?:\.[0-9]{1,2})?))|(?:([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rs|inr|₹|\$|€|£|debited|spent|paid|sent))/i;
  const amountMatch = text.match(amountRegex);

  let amount = 0;
  if (amountMatch) {
    const rawNum = (amountMatch[1] || amountMatch[2] || '').replace(/,/g, '');
    amount = parseFloat(rawNum);
  }

  // Fallback for standalone numbers if text is very short (e.g. "500 swiggy")
  if (isNaN(amount) || amount <= 0) {
    const standaloneMatch = text.match(/\b([0-9]+(?:\.[0-9]{1,2})?)\b/);
    if (standaloneMatch) {
      amount = parseFloat(standaloneMatch[1]);
    }
  }

  if (isNaN(amount) || amount <= 0) {
    // If no valid amount found, fallback with a default or return null
    return null;
  }

  // 2. Payment Method Detection
  const lowerText = text.toLowerCase();
  let paymentMethod: PaymentMethod = 'phonepe';

  if (lowerText.includes('phonepe') || lowerText.includes('@ybl') || lowerText.includes('@ibl')) {
    paymentMethod = 'phonepe';
  } else if (
    lowerText.includes('apple pay') ||
    lowerText.includes('applepay') ||
    lowerText.includes('apple card')
  ) {
    paymentMethod = 'apple_pay';
  } else if (
    lowerText.includes('google pay') ||
    lowerText.includes('gpay') ||
    lowerText.includes('@okaxis') ||
    lowerText.includes('@okhdfcbank') ||
    lowerText.includes('@okicici') ||
    lowerText.includes('@oksbi')
  ) {
    paymentMethod = 'gpay';
  } else if (lowerText.includes('paytm') || lowerText.includes('@paytm')) {
    paymentMethod = 'paytm';
  } else if (lowerText.includes('amazon pay') || lowerText.includes('@apl')) {
    paymentMethod = 'amazon_pay';
  } else if (lowerText.includes('cred')) {
    paymentMethod = 'cred';
  } else if (lowerText.includes('bhim') || lowerText.includes('upi')) {
    paymentMethod = 'bhim_upi';
  } else if (lowerText.includes('card') || lowerText.includes('pos')) {
    paymentMethod = 'card';
  }

  // 3. Merchant Detection
  let merchant = '';

  // Patterns like: "paid to <Merchant>", "sent to <Merchant>", "at <Merchant>", "debited ... to <Merchant>"
  const merchantPatterns = [
    /(?:paid\s+to|sent\s+to|transferred\s+to|transfer\s+to|payment\s+to|to)\s+([A-Za-z0-9&'’.\s-]{2,30}?)(?=\s+(?:via|using|on|ref|upi|for|dated|\.|\n|$))/i,
    /(?:at|for)\s+([A-Za-z0-9&'’.\s-]{2,30}?)(?=\s+(?:via|using|on|ref|dated|\.|\n|$))/i,
    /(?:VPA|UPI\s+ID)\s+([A-Za-z0-9_.-]+@[A-Za-z0-9]+)/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Filter out generic phrases
      if (
        !['account', 'your a/c', 'vpa', 'beneficiary', 'upi', 'phonepe', 'bank'].includes(
          candidate.toLowerCase()
        )
      ) {
        merchant = candidate;
        break;
      }
    }
  }

  // Clean up merchant name
  if (merchant) {
    merchant = merchant
      .replace(/^(the|a)\s+/i, '')
      .replace(/[\s.-]+$/, '')
      .trim();
  } else {
    // If not matched by regex, check known merchants
    const knownVendors = [
      'Starbucks',
      'Swiggy',
      'Zomato',
      'Uber',
      'Ola',
      'Zepto',
      'Blinkit',
      'Instamart',
      'Amazon',
      'Flipkart',
      'Myntra',
      'Netflix',
      'Spotify',
      'Apple Store',
      'Whole Foods',
      'Trader Joe',
      'Shell',
      'McDonald',
      'Dominos',
      'Chai Point',
      'Blue Tokai',
    ];
    for (const v of knownVendors) {
      if (lowerText.includes(v.toLowerCase())) {
        merchant = v;
        break;
      }
    }
  }

  if (!merchant) {
    merchant = 'UPI Merchant';
  }

  // Capitalize nicely
  merchant = merchant
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');

  // 4. Extract Reference ID if present
  let referenceId: string | undefined;
  const refMatch = text.match(/(?:ref|rrn|upi ref|txn id|txn)\s*(?:no\.?)?\s*[:#-]?\s*([0-9A-Za-z]{6,16})/i);
  if (refMatch) {
    referenceId = refMatch[1];
  }

  // 5. Intelligent Category Suggestion
  const mLower = merchant.toLowerCase();
  let suggestedCategoryId: string | undefined;

  // Check learned user rules first
  for (const rule of rules) {
    if (mLower.includes(rule.merchantKeyword.toLowerCase())) {
      suggestedCategoryId = rule.categoryId;
      break;
    }
  }

  // If no rule matches, use keyword heuristics
  if (!suggestedCategoryId) {
    const keywordMap: { keywords: string[]; catHints: string[] }[] = [
      {
        keywords: [
          'swiggy',
          'zomato',
          'starbucks',
          'coffee',
          'cafe',
          'restaurant',
          'diner',
          'bakery',
          'chai',
          'tea',
          'pizza',
          'burger',
          'mcdonald',
          'domino',
          'eat',
          'food',
          'bistro',
        ],
        catHints: ['dining', 'cafe', 'restaurant'],
      },
      {
        keywords: [
          'grocery',
          'groceries',
          'zepto',
          'blinkit',
          'instamart',
          'supermarket',
          'market',
          'bigbasket',
          'dmart',
          'whole foods',
          'trader joe',
          'nature basket',
          'milk',
          'fruits',
          'vegetables',
        ],
        catHints: ['groceries', 'market', 'supermarket'],
      },
      {
        keywords: [
          'uber',
          'ola',
          'rapido',
          'metro',
          'fuel',
          'petrol',
          'diesel',
          'shell',
          'hp',
          'bpcl',
          'indianoil',
          'flight',
          'airline',
          'train',
          'irctc',
          'parking',
          'toll',
          'fastag',
          'cab',
          'transit',
        ],
        catHints: ['transit', 'travel', 'transport'],
      },
      {
        keywords: [
          'amazon',
          'flipkart',
          'myntra',
          'zara',
          'h&m',
          'nike',
          'adidas',
          'shopping',
          'clothing',
          'apparel',
          'mall',
          'uniqlo',
          'retail',
        ],
        catHints: ['shopping', 'style', 'fashion'],
      },
      {
        keywords: [
          'gym',
          'cult',
          'fitness',
          'pharmacy',
          'apollo',
          'hospital',
          'clinic',
          '1mg',
          'medicine',
          'health',
          'doctor',
          'dentist',
        ],
        catHints: ['health', 'fitness', 'wellness'],
      },
      {
        keywords: [
          'netflix',
          'spotify',
          'prime video',
          'hotstar',
          'youtube',
          'movie',
          'pvr',
          'inox',
          'cinema',
          'steam',
          'playstation',
          'game',
        ],
        catHints: ['entertainment', 'subs'],
      },
      {
        keywords: [
          'electricity',
          'bescom',
          'tneb',
          'water',
          'wifi',
          'broadband',
          'airtel',
          'jio',
          'vodafone',
          'recharge',
          'bill',
          'gas',
          'cylinder',
          'utilities',
        ],
        catHints: ['bills', 'utilities'],
      },
      {
        keywords: ['rent', 'maintenance', 'society', 'landlord', 'housing'],
        catHints: ['housing', 'rent'],
      },
    ];

    for (const item of keywordMap) {
      if (item.keywords.some((k) => mLower.includes(k) || lowerText.includes(k))) {
        // Find matching category from available categories
        const matchedCategory = categories.find((c) =>
          item.catHints.some((hint) => c.name.toLowerCase().includes(hint))
        );
        if (matchedCategory) {
          suggestedCategoryId = matchedCategory.id;
          break;
        }
      }
    }
  }

  // Fallback to first category if none matched
  if (!suggestedCategoryId && categories.length > 0) {
    suggestedCategoryId = categories[0].id;
  }

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return {
    id: `detected-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    amount,
    merchant,
    date: today,
    time: nowTime,
    paymentMethod,
    referenceId,
    sourceText: text,
    suggestedCategoryId,
    detectedAt: new Date().toISOString(),
    status: 'pending',
  };
}
