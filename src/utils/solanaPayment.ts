import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

export interface PaymentResult {
  signature: string;
  success: boolean;
  error?: string;
}

export async function sendPayment(
  connection: Connection,
  senderPubkey: PublicKey,
  recipientAddress: string,
  amountSOL: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<PaymentResult> {
  try {
    if (amountSOL <= 0) {
      return {
        signature: '',
        success: false,
        error: 'Payment amount must be greater than 0'
      };
    }

    // Validate recipient address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipientAddress);
    } catch (err) {
      return {
        signature: '',
        success: false,
        error: 'Invalid recipient wallet address'
      };
    }

    // Create transfer instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipientPubkey,
        lamports: Math.floor(amountSOL * LAMPORTS_PER_SOL),
      })
    );

    // Get recent blockhash and set fee payer
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPubkey;

    // Sign transaction (will trigger wallet popup)
    const signed = await signTransaction(transaction);

    // Send transaction
    const signature = await connection.sendRawTransaction(signed.serialize());

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    return {
      signature,
      success: true
    };
  } catch (error) {
    console.error('Payment error:', error);

    // Handle common errors
    let errorMessage = 'Payment failed';
    if (error instanceof Error) {
      if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message.includes('insufficient')) {
        errorMessage = 'Insufficient SOL balance';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      signature: '',
      success: false,
      error: errorMessage
    };
  }
}

export function getSolanaExplorerUrl(signature: string, cluster: 'devnet' | 'mainnet-beta' = 'devnet'): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}
