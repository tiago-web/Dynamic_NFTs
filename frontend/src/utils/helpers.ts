import { ethers } from "ethers";

export enum DogType {
    BABY_PUG,
    BABY_SHIBA_INU,
    BABY_ST_BERNARD,
    ADULT_PUG,
    ADULT_SHIBA_INU,
    ADULT_ST_BERNARD
  }


export const mintPrice = ethers.utils.parseEther("0.001"); // 0.001 ETH
export const evolvePrice = ethers.utils.parseEther("0.0005"); // 0.0005 ETH