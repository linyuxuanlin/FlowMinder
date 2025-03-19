FROM node:latest

WORKDIR /app

COPY package*.json ./

# Install dependencies, ensure reactflow is installed correctly
RUN npm install --verbose
RUN npm list reactflow

# Copy all files
COPY . .

# Set environment variables
ENV REACT_APP_API_URL=http://localhost:5000
ENV NODE_ENV=development
ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV TSC_COMPILE_ON_ERROR=true
ENV DISABLE_ESLINT_PLUGIN=true

EXPOSE 3000

CMD ["npm", "start"]