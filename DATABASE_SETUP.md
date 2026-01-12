# Database Setup Guide

This guide will help you set up MongoDB for Daily Companion.

## Database Options

You have two options for running MongoDB:

1. **MongoDB Atlas (Cloud)** - Recommended for production and easy setup
2. **Local MongoDB** - Good for development

## Option 1: MongoDB Atlas (Cloud) - Recommended

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

### 2. Create a Cluster

1. Click "Build a Cluster" (or "Create" if you already have an account)
2. Select **FREE** tier (M0 Sandbox)
3. Choose a cloud provider and region closest to you
4. Click "Create Cluster"
5. Wait 1-3 minutes for the cluster to be created

### 3. Create Database User

1. Click on "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Select "Password" authentication method
4. Username: `dailycompanion` (or your choice)
5. Auto-generate a secure password (click the button)
6. **Copy the password immediately** - you'll need it for the connection string
7. Database User Privileges: "Atlas admin"
8. Click "Add User"

### 4. Whitelist IP Address

1. Click on "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For production, whitelist only your server's IP
4. Click "Confirm"

### 5. Get Connection String

1. Go back to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Click "Connect your application"
4. Select "Node.js" driver and version "4.1 or later"
5. Copy the connection string
6. It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Configure Connection String

1. Replace `<username>` with your database username
2. Replace `<password>` with the password you copied earlier
3. Add the database name before the `?`: `/daily-companion?`
4. Final format:
   ```
   mongodb+srv://dailycompanion:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/daily-companion?retryWrites=true&w=majority
   ```

### 7. Add to .env.local

Create or edit `.env.local` in your project root:

```env
MONGODB_URI=mongodb+srv://dailycompanion:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/daily-companion?retryWrites=true&w=majority
```

## Option 2: Local MongoDB

### Installation

#### Windows

1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Select "Complete" installation
4. Install as a Windows Service
5. Install MongoDB Compass (GUI tool) when prompted

#### macOS

Using Homebrew:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update packages
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Configuration

Add to your `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/daily-companion
```

### Verify Connection

```bash
# Open MongoDB shell
mongosh

# Or use MongoDB Compass GUI
# Connect to: mongodb://localhost:27017
```

## Testing the Connection

### 1. Install Dependencies

```bash
npm install mongoose
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Check Console

You should see:
```
✅ Connected to MongoDB
```

If you see an error, check:
- Connection string is correct in `.env.local`
- No extra spaces in the connection string
- MongoDB service is running (for local)
- IP is whitelisted (for Atlas)
- Username and password are correct (for Atlas)

## Database Structure

The application uses the following MongoDB collections:

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed, select: false),
  displayName: String,
  avatar: String,
  avatarType: 'initial' | 'photo',
  bio: String,
  provider: 'credentials' | 'google' | 'github',
  providerId: String,
  lastLogin: Date,
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  title: String,
  description: String,
  status: 'pending' | 'in-progress' | 'completed' (indexed),
  priority: 'low' | 'medium' | 'high' | 'urgent',
  tags: [String],
  startTime: Date (indexed),
  endTime: Date,
  duration: Number (minutes),
  completedAt: Date,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

## Useful MongoDB Commands

### MongoDB Shell (mongosh)

```bash
# Show all databases
show dbs

# Use daily-companion database
use daily-companion

# Show all collections
show collections

# Count users
db.users.countDocuments()

# Find all users
db.users.find().pretty()

# Count tasks
db.tasks.countDocuments()

# Find all tasks
db.tasks.find().pretty()

# Find tasks for specific user
db.tasks.find({ userId: ObjectId("user_id_here") }).pretty()

# Delete all data (careful!)
db.users.deleteMany({})
db.tasks.deleteMany({})
```

### Using MongoDB Compass

1. Connect to your database
2. Browse collections visually
3. Run queries with a GUI
4. Create indexes
5. Monitor performance

## Indexes

The following indexes are automatically created:

### Users Collection
- `email` (unique)
- `{ provider: 1, providerId: 1 }`

### Tasks Collection
- `userId`
- `status`
- `startTime`
- `{ userId: 1, startTime: -1 }`
- `{ userId: 1, status: 1 }`
- `{ userId: 1, createdAt: -1 }`

## Backup and Restore

### Backup

```bash
# MongoDB Atlas: Use Atlas UI -> Cluster -> ... -> Back Up

# Local MongoDB:
mongodump --db daily-companion --out ./backup
```

### Restore

```bash
# Local MongoDB:
mongorestore --db daily-companion ./backup/daily-companion
```

## Production Considerations

### Security

1. **Use strong passwords** for database users
2. **Whitelist only necessary IPs** in MongoDB Atlas
3. **Enable authentication** for local MongoDB:
   ```bash
   mongod --auth
   ```
4. **Never commit `.env.local`** - it's already in `.gitignore`
5. **Rotate database credentials** regularly

### Performance

1. **Monitor slow queries** in MongoDB Atlas
2. **Add indexes** for frequent queries
3. **Set up connection pooling** (already configured in mongoose)
4. **Use projections** to fetch only needed fields
5. **Consider sharding** for very large datasets

### Monitoring

MongoDB Atlas provides:
- Real-time performance metrics
- Slow query analysis
- Storage usage tracking
- Automated alerts

## Troubleshooting

### "MongooseServerSelectionError"

**Problem**: Can't connect to MongoDB

**Solutions**:
- Check if MongoDB service is running (local)
- Verify connection string format
- Check network/firewall settings
- Whitelist IP in Atlas
- Verify username/password

### "Authentication failed"

**Problem**: Wrong credentials

**Solutions**:
- Double-check username and password
- Ensure password is URL-encoded (special characters)
- Verify user has proper permissions

### "Database name required"

**Problem**: Missing database name in connection string

**Solution**: Add `/daily-companion` before the `?` in connection string:
```
mongodb+srv://user:pass@cluster.net/daily-companion?retryWrites=true
```

### Connection slow or timing out

**Problem**: Network issues or distant server

**Solutions**:
- Choose Atlas region closer to you
- Check internet connection
- Increase timeout in mongoose config

## Migration from localStorage

To migrate existing localStorage data to MongoDB:

1. Users will need to re-register or sign in with OAuth
2. Their localStorage data will remain accessible
3. Eventually, we can create a migration tool to import tasks

## Need Help?

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
