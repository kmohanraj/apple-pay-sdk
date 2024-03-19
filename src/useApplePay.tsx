"use client";

import axios from "axios";
import { useCallback, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const useApplePay = (priceToPay: string): [() => void, any] => {
  const [appleResponse, setAppleResponse] = useState();
  const appleSession = (window as any).ApplePaySession;
  const canMakeApplePayments = appleSession && appleSession.canMakePayments();
  const getMerchantCapabilities =
    process.env.REACT_APP_APPLE_MERCHANT_CAPABILITIES?.split("|");
  const getSupportedNetworks =
    process.env.REACT_APP_APPLE_SUPPORTED_NETWORKS?.split("|");

  const paymentRequest = () => {
    return {
      countryCode: process.env.REACT_APP_APPLE_COUNTRY_CODE,
      currencyCode: process.env.REACT_APP_APPLE_CURRENCY_CODE,
      merchantCapabilities: getMerchantCapabilities,
      supportedNetworks: getSupportedNetworks,
      total: {
        label: process.env.REACT_APP_APPLE_PAY_LABEL,
        type: "final",
        amount: priceToPay,
      },
    };
  };

  const validateMerchant = (merchantSession: any) => {
    return async (event: any) => {
      const response = (
        await axios.post("/api/wallet/apple-pay/get-merchant-session", {
          validationURL: event.validationURL,
        })
      ).data;
      if (response.data) {
        merchantSession.completeMerchantValidation(response.data);
      } else {
        merchantSession.abort();
      }
    };
  };

  const paymentAuthorized = (merchantSession: any) => {
    return (event: any) => {
      const paymentStatus = {
        status: appleSession.STATUS_SUCCESS,
      };
      if (paymentStatus.status === 0) {
        merchantSession.completePayment(paymentStatus);
        setAppleResponse(event.payment);
      } else {
        merchantSession.abort();
      }
    };
  };

  const handleOnApplePay = useCallback(async () => {
    if (canMakeApplePayments && priceToPay) {
      const merchantSession = new appleSession(3, paymentRequest());
      merchantSession.onvalidatemerchant = validateMerchant(merchantSession);
      merchantSession.onpaymentauthorized = paymentAuthorized(merchantSession);
      merchantSession.oncancel = () => {
        merchantSession.completePayment(appleSession.STATUS_FAILURE);
      };
      merchantSession.begin();
    }
  }, [priceToPay]);

  return [handleOnApplePay, appleResponse];
};
