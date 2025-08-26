'use client';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import NFTCard from '@/components/ui/NftCard';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useSearchParams } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';

interface LastSale {}

interface Listing {
  price: string;
  txId: string;
  seller: string;
  source: string;
  blockNumber: string;
  priceUnit: string | null;
}

interface Stats {
  buyNowPrice: string;
  buyNowPriceNetFees: string;
  floor7d: number;
  floor24h: number;
  marketCap: string;
  numBids: number;
  numListed: number;
  numListed7d: number;
  numListed24h: number;
  numMints: number;
  pctListed: number;
  sales1h: number;
  sales7d: number;
  sales24h: number;
  salesAll: number;
  volume1h: string;
  volume7d: string;
  volume24h: string;
  volumeAll: string;
}

export interface Nft {
  mint: string;
  slug: string;
  frozen: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: Array<any>;
  imageUri: string;
  lastSale: LastSale;
  metadataFetchedAt: number;
  metadataUri: string;
  animationUri: string;
  name: string;
  rarityRank: number;
  royaltyBps: number;
  tokenEdition: string;
  tokenStandard: string;
  hidden: boolean;
  compressed: boolean;
  verifiedCollection: string;
  updateAuthority: string;
  listing: Listing;
  inscription: string;
  tokenProgram: string;
  metadataProgram: string;
  transferHookProgram: string;
  owner: string;
}

export default function Home() {
  const fetchData = async (
    cursor: string | null = null,
    mint: string | null = null
  ) => {
    if (hasMore === false) return;

    axios
      .get('api/collectionListings', {
        params: {
          collectionId: 'bd366797-5599-417a-be03-1e43a7e3fb90',
          limit: mint ? 1 : 10,
          cursor,
          mint,
        },
      })
      .then((response) => {
        setNfts([...nfts, ...response.data.mints]);
        setCursor(response.data.page.endCursor);
        setHasMore(response.data.page.hasMore);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchStats = async () => {
    axios
      .get('api/collectionStats', {
        params: {
          collectionSlug: process.env.NEXT_PUBLIC_COLLECTION_SLUG!,
        },
      })
      .then((response) => {
        setStats(response.data.collections[0].stats);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const wallet = useWallet();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchStats();

    // route handler
    if (searchParams.get('mint')) {
      fetchData(null, searchParams.get('mint'));
    } else {
      fetchData(cursor);
    }
  }, []);

  useMemo(() => {
    const walletBalance = async () => {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL!
      );
      const balance = await connection.getBalance(wallet.publicKey!);
      setBalance(balance / LAMPORTS_PER_SOL);
    };

    if (wallet.connected) walletBalance();
  }, [wallet.publicKey, wallet.connected]);

  const [nfts, setNfts] = useState<Nft[]>([]);
  const [cursor, setCursor] = useState<null | string>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<Stats | null>(null);

  return (
    <WalletModalProvider>
      <main className="flex flex-grow flex-col items-center">
        <header className="flex justify-between items-center w-4/5 my-8">
          <WalletMultiButton />
          <h1 className="text-4xl font-bold">NFT Marketplace</h1>
          <p className="text-sm">Balance: {balance}</p>
        </header>

        {stats != null && (
          <div className="mt-10 mb-4 w-4/5 text-sm">
            <div className="grid grid-cols-4 gap-4 text-center text-small">
              <div className="stats-box  p-4">
                <h2 className="text-lg font-bold">Total NFTs</h2>
                <p>{stats.numMints}</p>
              </div>
              <div className="stats-box p-4">
                <h2 className="text-lg font-bold">Total Sales</h2>
                <p>{stats.salesAll}</p>
              </div>
              <div className="stats-box   p-4">
                <h2 className="text-lg font-bold">Listings</h2>
                <p>{stats.numListed}</p>
              </div>
              <div className="stats-box  p-4">
                <h2 className="text-lg font-bold">Marketcap</h2>
                <p>
                  {Math.round(Number(stats.marketCap) / LAMPORTS_PER_SOL)} ◎
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex w-4/5">
          <InfiniteScroll
            dataLength={nfts.length} //This is important field to render the next data
            next={() => fetchData(cursor)}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {/* <div className=> */}
            {nfts.map((nft: Nft) => (
              <NFTCard
                connectedWallet={String(wallet.publicKey?.toBase58())}
                key={nft.mint}
                nft={nft}
                // supply={Number(stats?.numMints) || 0}
                selected={true}
                signAllTransactions={wallet.signAllTransactions}
              />
            ))}
            {/* </div> */}
          </InfiniteScroll>
        </div>
      </main>
    </WalletModalProvider>
  );
}
