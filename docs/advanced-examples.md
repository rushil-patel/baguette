# Advanced Baguette Examples

This document provides advanced examples of using Baguette for complex data traversal scenarios.

## Working with Deeply Nested Data

### Multi-level Object and Array Traversal

```javascript
import { bget } from 'baguette';

const data = {
  organization: {
    departments: [
      {
        name: 'Engineering',
        teams: [
          {
            name: 'Frontend',
            members: [
              { id: 'fe1', name: 'Alice', skills: ['React', 'TypeScript'] },
              { id: 'fe2', name: 'Bob', skills: ['Vue', 'JavaScript'] }
            ]
          },
          {
            name: 'Backend',
            members: [
              { id: 'be1', name: 'Charlie', skills: ['Node.js', 'Python'] },
              { id: 'be2', name: 'Diana', skills: ['Java', 'Go'] }
            ]
          }
        ]
      },
      {
        name: 'Marketing',
        teams: [
          {
            name: 'Content',
            members: [
              { id: 'cm1', name: 'Eve', skills: ['Copywriting', 'SEO'] },
              { id: 'cm2', name: 'Frank', skills: ['Social Media', 'Analytics'] }
            ]
          }
        ]
      }
    ]
  }
};

// Get all department names
bget(data, 'organization.departments[].name');
// ['Engineering', 'Marketing']

// Get all team names across all departments
bget(data, 'organization.departments[].teams[].name');
// [['Frontend', 'Backend'], ['Content']]

// Get all member names across all teams and departments
bget(data, 'organization.departments[].teams[].members[].name');
// [[['Alice', 'Bob'], ['Charlie', 'Diana']], [['Eve', 'Frank']]]

// Get all members with React skills
bget(data, 'organization.departments[].teams[].members[skills.includes("React")].name');
// [[['Alice'], []], [[]]]
```

## Complex Filtering

### Multiple Conditions

```javascript
import { bget } from 'baguette';

const products = {
  items: [
    { id: 'p1', name: 'Laptop', price: 1200, category: 'Electronics', inStock: true },
    { id: 'p2', name: 'Headphones', price: 100, category: 'Electronics', inStock: false },
    { id: 'p3', name: 'Desk', price: 300, category: 'Furniture', inStock: true },
    { id: 'p4', name: 'Chair', price: 150, category: 'Furniture', inStock: true },
    { id: 'p5', name: 'Phone', price: 800, category: 'Electronics', inStock: true }
  ]
};

// Get all electronics that are in stock
bget(products, 'items[category === "Electronics" && inStock === true].name');
// ['Laptop', 'Phone']

// Get all products that are either expensive electronics or any furniture
bget(products, 'items[(category === "Electronics" && price > 500) || category === "Furniture"].name');
// ['Laptop', 'Desk', 'Chair', 'Phone']

// Get all products that are in stock and cost less than 500
bget(products, 'items[inStock === true && price < 500].name');
// ['Desk', 'Chair']
```

### Using JavaScript Methods in Expressions

```javascript
import { bget } from 'baguette';

const users = {
  accounts: [
    { id: 'u1', name: 'Alice Smith', email: 'alice@example.com', lastLogin: '2023-01-15' },
    { id: 'u2', name: 'Bob Johnson', email: 'bob@example.com', lastLogin: '2023-02-20' },
    { id: 'u3', name: 'Charlie Brown', email: 'charlie@example.com', lastLogin: '2023-01-05' },
    { id: 'u4', name: 'Diana Miller', email: 'diana@example.com', lastLogin: '2023-03-10' }
  ]
};

// Get users with gmail addresses
bget(users, 'accounts[email.endsWith("@gmail.com")].name');
// []

// Get users whose names start with a specific letter
bget(users, 'accounts[name.startsWith("B")].name');
// ['Bob Johnson']

// Get users who logged in before February
bget(users, 'accounts[new Date(lastLogin) < new Date("2023-02-01")].name');
// ['Alice Smith', 'Charlie Brown']

// Get users with specific substring in their name
bget(users, 'accounts[name.includes("Smith")].email');
// ['alice@example.com']
```

## Combining with Other Operations

### Post-Processing Results

After using Baguette to extract data, you can further process the results using standard JavaScript methods:

```javascript
import { bget } from 'baguette';

const data = {
  sales: [
    { quarter: 'Q1', amount: 1000 },
    { quarter: 'Q2', amount: 1500 },
    { quarter: 'Q3', amount: 1200 },
    { quarter: 'Q4', amount: 2000 }
  ]
};

// Get all sales amounts
const amounts = bget(data, 'sales[].amount');
// [1000, 1500, 1200, 2000]

// Calculate total sales
const totalSales = amounts.reduce((sum, amount) => sum + amount, 0);
// 5700

// Find maximum quarterly sales
const maxSales = Math.max(...amounts);
// 2000

// Find quarter with maximum sales
const maxQuarter = bget(data, 'sales[amount === ' + maxSales + '].quarter')[0];
// 'Q4'
```

## Error Handling Strategies

### Using Default Values

```javascript
import { bget } from 'baguette';

const data = {
  user: {
    profile: {
      name: 'Alice'
      // address is missing
    }
  }
};

// Provide default for missing nested property
const address = bget(data, 'user.profile.address', 'Address not provided');
// 'Address not provided'

// Provide default for missing deeply nested property
const zipCode = bget(data, 'user.profile.address.zipCode', '00000');
// '00000'

// Provide default for potentially missing parent object
const phoneNumber = bget(data, 'user.contact.phone', 'No phone number');
// 'No phone number'
```

### Conditional Logic with Baguette

```javascript
import { bget } from 'baguette';

const user = {
  name: 'Alice',
  subscription: {
    type: 'premium',
    expiresAt: '2023-12-31'
  }
  // payment field may or may not exist
};

// Check if payment method exists before accessing it
const paymentMethod = bget(user, 'payment.method');
if (paymentMethod) {
  console.log(`Payment method: ${paymentMethod}`);
} else {
  console.log('No payment method found');
}

// Use default values for conditional logic
const subscriptionType = bget(user, 'subscription.type', 'free');
if (subscriptionType === 'premium') {
  console.log('User has premium access');
} else {
  console.log('User has basic access');
}
```

## Performance Tips

### Reusing Path Strings

When repeatedly accessing the same path, store the path string in a variable:

```javascript
import { bget } from 'baguette';

const data = {
  // ... large nested data structure
};

// Define paths once
const userPath = 'users[].profile.details';
const activePath = 'users[status === "active"].profile.details';

// Use in multiple places
const allUserDetails = bget(data, userPath);
const activeUserDetails = bget(data, activePath);
```

### Avoiding Unnecessary Depth

When possible, extract data at a higher level and then process it:

```javascript
import { bget } from 'baguette';

const data = {
  departments: [
    {
      name: 'Engineering',
      employees: [/* many employees */]
    },
    {
      name: 'Marketing',
      employees: [/* many employees */]
    }
  ]
};

// Less efficient: traversing the entire structure multiple times
const engineeringNames = bget(data, 'departments[name === "Engineering"].employees[].name');
const marketingNames = bget(data, 'departments[name === "Marketing"].employees[].name');

// More efficient: extract departments once, then process
const departments = bget(data, 'departments');
const engineering = departments.find(dept => dept.name === 'Engineering');
const marketing = departments.find(dept => dept.name === 'Marketing');

const engineeringNames2 = engineering ? engineering.employees.map(emp => emp.name) : [];
const marketingNames2 = marketing ? marketing.employees.map(emp => emp.name) : [];
```
