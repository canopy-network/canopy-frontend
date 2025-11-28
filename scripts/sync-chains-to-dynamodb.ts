/**
 * @fileoverview Script to sync chains from API to DynamoDB
 *
 * This script fetches all chains from the API and stores them in DynamoDB.
 * Only stores: ticker (token_symbol), chain_name, and token_name.
 *
 * Usage:
 *   npx tsx scripts/sync-chains-to-dynamodb.ts
 *
 * Environment variables required:
 *   - S3_ACCESS_KEY: AWS access key
 *   - S3_SECRET_KEY: AWS secret key
 *   - CHAINS_LIST_TABLE_ARN: DynamoDB table ARN (arn:aws:dynamodb:us-east-1:027924002187:table/canopy-network-chains-list)
 */

import axios from "axios";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import dotenv from "dotenv";

dotenv.config();

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
});

// Extract table name from ARN
function getTableNameFromArn(arn: string): string {
  const parts = arn.split("/");
  return parts[parts.length - 1];
}

const TABLE_ARN =
  process.env.CHAINS_LIST_TABLE_ARN ||
  "arn:aws:dynamodb:us-east-1:027924002187:table/canopy-network-chains-list";
const TABLE_NAME = getTableNameFromArn(TABLE_ARN);

const API_URL =
  "http://app.neochiba.net:3001/api/v1/chains?include=assets&limit=10";

interface ChainData {
  id: number;
  chain_name: string;
  token_name: string | null;
  token_symbol: string;
  branding: string | null;
}

interface ChainItem {
  id: number;
  ticker: string; // token_symbol
  chain_name: string;
  token_name: string; // Use chain_name as fallback if empty
  updated_at: string;
  branding: string | null;
}

async function fetchAllChains(): Promise<ChainData[]> {
  console.log("Fetching chains from API...");

  try {
    const response = await axios.get(API_URL);

    const pagination = response.data.pagination;

    const chains = response.data.data || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = chains.map((chain: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const branding = chain.assets?.find((asset: any) =>
        ["logo", "branding"].includes(asset.asset_type)
      )?.file_url;

      return {
        branding,
        id: chain.id,
        chain_name: chain.chain_name,
        token_name: chain.token_name,
        token_symbol: chain.token_symbol,
        updated_at: chain.updated_at,
      };
    });

    console.log(
      `Fetched ${payload.length} chains from page 1 of ${pagination.pages}`
    );

    let allChains: ChainData[] = payload;
    for (let i = 1; i < pagination.pages; i++) {
      console.log(`Fetching page ${i + 1} of ${pagination.pages}`);
      const response = await axios.get(`${API_URL}&page=${i + 1}`);
      const chains = response.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = chains.map((chain: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const branding = chain.assets?.find((asset: any) =>
          ["logo", "branding"].includes(asset.asset_type)
        )?.file_url;
        return {
          branding,
          id: chain.id,
          chain_name: chain.chain_name,
          token_name: chain.token_name,
          token_symbol: chain.token_symbol,
          updated_at: chain.updated_at,
        };
      });

      console.log(
        `Fetched ${payload.length} chains from page ${i + 1} of ${
          pagination.pages
        }`
      );

      allChains = [...allChains, ...payload];
    }

    console.log(`Fetched ${allChains.length} chains from API`);
    return allChains;
  } catch (error: unknown) {
    console.error("Error fetching chains from API:", error);
    throw error;
  }
}

async function storeChainInDynamoDB(chain: ChainData): Promise<void> {
  // Use chain_name as fallback if token_name is empty or null
  const tokenName = chain.token_name?.trim() || chain.chain_name;

  const item: ChainItem = {
    id: chain.id,
    ticker: chain.token_symbol,
    chain_name: chain.chain_name,
    token_name: tokenName,
    updated_at: new Date().toISOString(),
    branding: chain.branding,
  };

  const command = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(item),
  });

  await dynamoClient.send(command);
}

async function syncChains(): Promise<void> {
  try {
    // Validate environment variables
    if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      throw new Error(
        "Missing required environment variables: S3_ACCESS_KEY and S3_SECRET_KEY"
      );
    }

    if (!TABLE_NAME) {
      throw new Error("Invalid TABLE_ARN. Could not extract table name.");
    }

    console.log(`Using DynamoDB table: ${TABLE_NAME}`);

    // Fetch all chains from API
    const chains = await fetchAllChains();

    if (chains.length === 0) {
      console.log("No chains found to sync.");
      return;
    }

    // Store each chain in DynamoDB
    console.log("Storing chains in DynamoDB...");
    let successCount = 0;
    let errorCount = 0;

    for (const chain of chains) {
      try {
        // Only store if we have the required fields
        if (chain.token_symbol && chain.chain_name) {
          await storeChainInDynamoDB(chain);
          successCount++;
          console.log(`✓ Stored: ${chain.chain_name} (${chain.token_symbol})`);
        } else {
          console.warn(
            `⚠ Skipping chain ${chain.id}: missing required fields (token_symbol or chain_name)`
          );
        }
      } catch (error: unknown) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `✗ Error storing chain ${chain.id} (${chain.chain_name}):`,
          errorMessage
        );
      }
    }

    console.log("\n=== Sync Complete ===");
    console.log(`Total chains processed: ${chains.length}`);
    console.log(`Successfully stored: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Fatal error during sync:", errorMessage);
    process.exit(1);
  }
}

// Run the script
// if (require.main === module) {
syncChains()
  .then(() => {
    console.log("Script completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
// }

// syncChains();
// export { syncChains };
