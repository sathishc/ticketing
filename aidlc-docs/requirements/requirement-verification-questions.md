# Requirement Verification Questions

Please answer all questions below using the [Answer]: format. For multiple choice questions, select the letter (A, B, C, D) that best fits your needs.

## Core Functionality Questions

### 1. What type of ticketing service are you building?
A) Event ticketing (concerts, sports, theater)
B) Support/Help desk ticketing system
C) Transportation ticketing (bus, train, airline)
D) Other (please specify)

[Answer]: B

### 2. Who are the primary users of this system?
A) End customers purchasing tickets
B) Internal staff managing support requests
C) Both customers and staff
D) Other (please specify)

[Answer]: B

### 3. What are the core features you need?
Please check all that apply:
- [X] Create tickets/issues
- [X] Assign tickets to agents/staff
- [X] Track ticket status
- [ ] Customer communication
- [ ] Payment processing
- [ ] Seat selection
- [ ] Event management
- [ ] Reporting and analytics
- [ ] Other: _______________

[Answer]: 

### 4. What ticket lifecycle do you envision?
A) Simple: Open → In Progress → Closed
B) Detailed: New → Assigned → In Progress → Pending → Resolved → Closed
C) Event-based: Available → Reserved → Purchased → Used
D) Custom workflow (please describe)

[Answer]: B

## User Management Questions

### 5. What types of users will access the system?
A) Customers only
B) Customers and support agents
C) Customers, agents, and administrators
D) Other roles (please specify)

[Answer]: C

### 6. How should users authenticate?
A) Simple username/password
B) Email/password with verification
C) Social login (Google, Facebook, etc.)
D) Enterprise SSO integration
E) Multiple options

[Answer]: A

## Technical Requirements

### 7. What are your performance expectations?
A) Small scale (< 1000 users, < 10,000 tickets)
B) Medium scale (1000-10,000 users, 10,000-100,000 tickets)
C) Large scale (> 10,000 users, > 100,000 tickets)
D) Enterprise scale with high availability requirements

[Answer]: C

### 8. Do you need real-time features?
A) No real-time features needed
B) Real-time notifications
C) Real-time chat/messaging
D) Real-time collaboration features

[Answer]: A

### 9. What integrations do you need?
Please check all that apply:
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Payment gateways
- [ ] Calendar systems
- [ ] Third-party APIs
- [ ] Reporting tools
- [ ] Other: _______________

[Answer]: 

## Business Requirements

### 10. Do you need payment processing?
A) No payment features
B) Simple payment processing
C) Complex pricing (discounts, promotions, tiers)
D) Subscription-based billing

[Answer]: A

### 11. What reporting capabilities do you need?
A) Basic ticket counts and status
B) Detailed analytics and metrics
C) Custom reporting and dashboards
D) Data export capabilities

[Answer]: B

### 12. Are there any compliance requirements?
A) No specific compliance needs
B) GDPR/Privacy regulations
C) Industry-specific compliance (healthcare, finance, etc.)
D) Accessibility requirements (WCAG)

[Answer]: A

## Additional Context

### 13. Are there any existing systems this needs to integrate with?
[Answer]: No

### 14. What is your preferred technology stack or any constraints?
[Answer]: DynamoDB for Database, Nodejs based middlware on ECS Fargate, Amplify for Frontend and CDK for infrastructure

### 15. Any specific business rules or workflows that are critical?
[Answer]: No

---

**Instructions**: Please fill in all [Answer]: fields above and let me know when you're ready for me to review your responses.
