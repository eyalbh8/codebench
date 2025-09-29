# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

ARG DATABASE_URL

# sanity check: fail fast if empty
RUN test -n $DATABASE_URL || (echo "DATABASE_URL is EMPTY" && exit 1)
RUN printenv | grep -E 'BUILD_DATABASE_URL|DATABASE_URL' || true

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY node_modules/.prisma ./node_modules/.prisma
COPY node_modules/@prisma/client ./node_modules/@prisma/client

# Install dependencies
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /app

# Copy source
COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN DATABASE_URL=postgresql://postgres:GoodJobAll123!@63.178.94.164:5432/app npm run prisma:generate
RUN DATABASE_URL=postgresql://postgres:GoodJobAll123!@63.178.94.164:5432/app npm run prisma:generatesql

# Build the application
RUN npm run build

# Stage 3: Coralogix Layer
FROM coralogixrepo/coralogix-nodejs-wrapper-and-exporter:28 AS coralogix

# Stage 4: Production
FROM public.ecr.aws/lambda/nodejs:20

# Copy Coralogix layer
WORKDIR /opt
COPY --from=coralogix /opt/ .

# Set working directory to Lambda task root
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/public ./public

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Set environment variables
ENV NODE_ENV=production
ENV AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler

# Set the handler
CMD ["dist/lambda.handler"]
