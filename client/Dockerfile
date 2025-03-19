FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Set environment variables for React to use
ENV REACT_APP_API_URL=http://localhost:5000
ENV NODE_ENV=development
ENV CI=false

EXPOSE 3000

CMD ["npm", "start"] 