export interface OrderBookEntry {
  id: string;
  amount: string;
  price: string;
  volume: string;
  tokenSymbol: string;
}

export const mockOrderBookEntries: OrderBookEntry[] = [
  { id: "1", amount: "1,234.56", price: "0.7234", volume: "892.45", tokenSymbol: "CNPY" },
  { id: "2", amount: "987.32", price: "0.7235", volume: "714.23", tokenSymbol: "CNPY" },
  { id: "3", amount: "2,456.78", price: "0.7233", volume: "1,778.90", tokenSymbol: "CNPY" },
  { id: "4", amount: "543.21", price: "0.7236", volume: "393.09", tokenSymbol: "CNPY" },
  { id: "5", amount: "1,876.54", price: "0.7232", volume: "1,357.42", tokenSymbol: "CNPY" },
  { id: "6", amount: "765.43", price: "0.7237", volume: "553.98", tokenSymbol: "CNPY" },
  { id: "7", amount: "3,210.98", price: "0.7231", volume: "2,322.35", tokenSymbol: "CNPY" },
  { id: "8", amount: "432.10", price: "0.7238", volume: "312.80", tokenSymbol: "CNPY" },
  { id: "9", amount: "1,654.32", price: "0.7230", volume: "1,196.07", tokenSymbol: "CNPY" },
  { id: "10", amount: "892.65", price: "0.7239", volume: "646.15", tokenSymbol: "CNPY" },
  { id: "11", amount: "2,345.67", price: "0.7229", volume: "1,695.42", tokenSymbol: "CNPY" },
  { id: "12", amount: "678.90", price: "0.7240", volume: "491.52", tokenSymbol: "CNPY" },
  { id: "13", amount: "1,543.21", price: "0.7228", volume: "1,115.45", tokenSymbol: "CNPY" },
  { id: "14", amount: "934.56", price: "0.7241", volume: "676.08", tokenSymbol: "CNPY" },
  { id: "15", amount: "2,876.54", price: "0.7227", volume: "2,078.55", tokenSymbol: "CNPY" },
  { id: "16", amount: "456.78", price: "0.7242", volume: "330.57", tokenSymbol: "CNPY" },
  { id: "17", amount: "1,987.65", price: "0.7226", volume: "1,436.09", tokenSymbol: "CNPY" },
  { id: "18", amount: "823.45", price: "0.7243", volume: "596.29", tokenSymbol: "CNPY" },
  { id: "19", amount: "3,456.78", price: "0.7225", volume: "2,497.52", tokenSymbol: "CNPY" },
  { id: "20", amount: "612.34", price: "0.7244", volume: "443.63", tokenSymbol: "CNPY" },
];
