# RAG System Evaluation

## Retrieval Quality Tests (10 tests)
| Test ID | Question | Expected Documents | Pass Criteria |
|---------|----------|-------------------|---------------|
| R01 | How do I create a seller account on Shoplite? | Document 8: Shoplite Seller Account Setup and Management | Retrieved docs contain expected title |
| R02 | What are Shoplite's return policies? | Document 6: Shoplite Return and Refund Policies | Retrieved docs are relevant to question |
| R03 | How does Shoplite handle order tracking? | Document 5: Shoplite Order Tracking and Delivery | Retrieved docs contain expected title |
| R04 | What payment methods does Shoplite accept? | Document 16: Shoplite Payment Methods and Security | Retrieved docs are relevant to question |
| R05 | How does inventory management work for sellers? | Document 9: Shoplite Inventory Management for Sellers | Retrieved docs contain expected title |
| R06 | What are the benefits of Shoplite Plus? | Document 19: Shoplite Subscription Services | Retrieved docs are relevant to question |
| R07 | How does international shipping work on Shoplite? | Document 18: Shoplite International Shipping Options | Retrieved docs contain expected title |
| R08 | What features are available in the Shoplite mobile app? | Document 12: Shoplite Mobile App Features | Retrieved docs are relevant to question |
| R09 | How does Shoplite ensure review authenticity? | Document 7: Shoplite Product Reviews and Ratings | Retrieved docs contain expected title |
| R10 | What is Shoplite's commission structure? | Document 10: Shoplite Commission and Fee Structure | Retrieved docs are relevant to question |

## Response Quality Tests (15 tests)  
| Test ID | Question | Required Keywords | Forbidden Terms | Expected Behavior |
|---------|----------|-------------------|-----------------|-------------------|
| Q01 | How do I create a seller account on Shoplite? | ["seller registration", "business verification", "2-3 business days"] | ["instant approval", "no verification required"] | Direct answer with citation |
| Q02 | What are Shoplite's return policies? | ["30-day return window", "return authorization", "original condition"] | ["no returns accepted", "lifetime returns"] | Direct answer with citation |
| Q03 | How do I track my order on Shoplite? | ["order tracking", "unique tracking number", "real-time updates"] | ["no tracking available", "manual tracking only"] | Direct answer with citation |
| Q04 | What payment methods does Shoplite accept? | ["credit cards", "digital wallets", "Shoplite Pay"] | ["cash only", "no digital payments"] | Direct answer with citation |
| Q05 | How does inventory management work for sellers? | ["inventory management", "bulk upload", "low stock alerts"] | ["manual inventory tracking", "no automation"] | Direct answer with citation |
| Q06 | What are the benefits of Shoplite Plus? | ["Shoplite Plus", "free expedited shipping", "early access"] | ["no benefits", "free subscription"] | Direct answer with citation |
| Q07 | How does international shipping work? | ["international shipping", "customs duties", "tracking capabilities"] | ["no international shipping", "customs not handled"] | Direct answer with citation |
| Q08 | What features are in the mobile app? | ["mobile app", "biometric login", "AR visualization"] | ["no special features", "desktop only"] | Direct answer with citation |
| Q09 | How does Shoplite ensure review authenticity? | ["verified purchasers", "AI detection", "fake reviews"] | ["unverified reviews", "no authenticity checks"] | Direct answer with citation |
| Q10 | What is Shoplite's commission structure? | ["commission rate", "5% to 15%", "transaction fee"] | ["no commission", "fixed rates only"] | Direct answer with citation |
| Q11 | What are Shoplite's return policies and how do I track my order? | ["30-day return window", "order tracking", "return authorization"] | ["no returns accepted", "lifetime returns"] | Multi-source synthesis |
| Q12 | What payment methods does Shoplite accept and how are they secured? | ["credit cards", "end-to-end encryption", "tokenized"] | ["unsecured payments", "stored payment information"] | Multi-source synthesis |
| Q13 | What are the requirements for sellers and how does inventory management work? | ["order defect rate", "inventory management", "bulk upload"] | ["no performance requirements", "manual inventory tracking"] | Multi-source synthesis |
| Q14 | How do promotional codes work and what are the benefits of Shoplite Plus? | ["promotional codes", "minimum purchase", "Shoplite Plus"] | ["no restrictions", "no benefits"] | Multi-source synthesis |
| Q15 | What security measures protect user data and how does Shoplite handle disputes? | ["AES-256 encryption", "dispute resolution", "resolution team"] | ["no encryption", "no resolution process"] | Multi-source synthesis |

## Edge Case Tests (5 tests)
| Test ID | Scenario | Expected Response Type |
|---------|----------|----------------------|
| E01 | Question not in knowledge base: "How do I integrate Shoplite with Salesforce?" | Refusal with explanation |
| E02 | Ambiguous question: "How do returns work?" | Clarification request |
| E03 | Contradictory information: "What is Shoplite's return policy for items that can't be returned?" | Acknowledgment of contradiction |
| E04 | Vague question: "Tell me about Shoplite." | Request for specificity |
| E05 | Outdated information question: "How do I use the discontinued Shoplite Auction feature?" | Information that feature is no longer available |
