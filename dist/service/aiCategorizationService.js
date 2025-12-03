"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AICategorizationService = void 0;
const fuse_js_1 = __importDefault(require("fuse.js"));
class AICategorizationService {
    constructor() {
        this.categoryKeywords = {
            'Food & Dining': [
                'mcdonalds', 'kfc', 'starbucks', 'starbuck', 'star bucks',
                'restaurant', 'cafe', 'coffee shop', 'pizza', 'burger',
                'food', 'dinner', 'lunch', 'breakfast', 'meal', 'eat',
                'subway', 'dominos', 'pizza hut', 'burger king', 'wendys',
                'chipotle', 'taco bell', 'dunkin donuts', 'panera'
            ],
            'Shopping': [
                'amazon', 'walmart', 'target', 'best buy', 'costco',
                'mall', 'store', 'shop', 'purchase', 'buy', 'shopping',
                'market', 'retail', 'online shopping', 'web store',
                'nike', 'adidas', 'apple store', 'sephora', 'home depot'
            ],
            'Entertainment': [
                'netflix', 'spotify', 'youtube premium', 'hulu', 'disney plus',
                'cinema', 'movie', 'theater', 'concert', 'game', 'entertainment',
                'fun', 'hobby', 'music', 'streaming', 'video game', 'playstation',
                'xbox', 'nintendo'
            ],
            'Transportation': [
                'uber', 'lyft', 'taxi', 'ride share', 'gas', 'fuel', 'petrol',
                'station', 'bus', 'train', 'metro', 'subway', 'transit',
                'commute', 'travel', 'airport', 'parking', 'toll'
            ],
            'Bills & Utilities': [
                'electric', 'water', 'internet', 'phone', 'wifi', 'cable',
                'bill', 'payment', 'subscription', 'utility', 'service',
                'at&t', 'verizon', 'comcast', 'spectrum'
            ],
            'Healthcare': [
                'hospital', 'doctor', 'pharmacy', 'medical', 'clinic',
                'health', 'medicine', 'dental', 'insurance', 'prescription',
                'cvs', 'walgreens', 'medical center'
            ],
            'Income': [
                'salary', 'paycheck', 'deposit', 'transfer', 'refund',
                'income', 'payment received', 'direct deposit', 'payroll'
            ],
            'Travel': [
                'hotel', 'airline', 'airport', 'booking', 'vacation',
                'travel', 'flight', 'airbnb', 'hotel stay', 'resort'
            ],
            'Education': [
                'school', 'university', 'college', 'course', 'bookstore',
                'tuition', 'student', 'education', 'learning', 'textbook'
            ]
        };
        this.fuseInstances = {};
        for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
            this.fuseInstances[category] = new fuse_js_1.default(keywords, {
                includeScore: true,
                threshold: 0.4,
                distance: 50,
                minMatchCharLength: 2,
                shouldSort: true,
                includeMatches: true
            });
        }
    }
    async categorizeTransaction(description, amount) {
        const desc = description.toLowerCase().trim();
        const matches = [];
        for (const [category, fuse] of Object.entries(this.fuseInstances)) {
            const results = fuse.search(desc);
            if (results.length > 0) {
                const bestMatch = results[0];
                const matchScore = bestMatch.score || 1;
                const confidence = 1 - matchScore;
                if (confidence > 0.3) {
                    matches.push({
                        category,
                        confidence,
                        matchedKeyword: bestMatch.item
                    });
                }
            }
        }
        if (matches.length > 0) {
            matches.sort((a, b) => b.confidence - a.confidence);
            const bestMatch = matches[0];
            let finalConfidence = bestMatch.confidence;
            if (bestMatch.confidence > 0.8) {
                finalConfidence = Math.min(bestMatch.confidence * 1.1, 0.95);
            }
            return {
                category: bestMatch.category,
                confidence: finalConfidence,
                matchedKeyword: bestMatch.matchedKeyword
            };
        }
        return this.amountBasedCategorization(amount);
    }
    amountBasedCategorization(amount) {
        if (amount > 1000)
            return { category: 'Income', confidence: 0.3 };
        if (amount > 200)
            return { category: 'Bills & Utilities', confidence: 0.2 };
        if (amount > 50)
            return { category: 'Shopping', confidence: 0.15 };
        return { category: 'Food & Dining', confidence: 0.1 };
    }
    async learnFromCorrection(description, correctCategory) {
        const words = description.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['the', 'and', 'for', 'with', 'from'].includes(word));
        if (!this.categoryKeywords[correctCategory]) {
            this.categoryKeywords[correctCategory] = [];
        }
        words.forEach(word => {
            if (!this.categoryKeywords[correctCategory].includes(word)) {
                this.categoryKeywords[correctCategory].push(word);
            }
        });
        this.fuseInstances[correctCategory] = new fuse_js_1.default(this.categoryKeywords[correctCategory], {
            includeScore: true,
            threshold: 0.4,
            distance: 50,
            minMatchCharLength: 2
        });
        console.log(`Learned from correction: Added keywords ${words.join(', ')} to category ${correctCategory}`);
    }
}
exports.AICategorizationService = AICategorizationService;
