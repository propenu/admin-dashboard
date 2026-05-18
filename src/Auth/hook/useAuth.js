import { useMutation, useQueryClient } from "@tanstack/react-query";

import { 
  requestOtp, 
  verifyOtpService, 
  createRequestOtp, 
  createVerifyOtpService,
  createUserLocationDetails
 } from "../../features/user/userService";

/////////////////////////////////////////////////
// REQUEST OTP
/////////////////////////////////////////////////

export const useCreateRequestOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestOtp,

    onSuccess: (data) => {
      queryClient.setQueryData(["requestOtp"], data);

      console.log("OTP Sent");
    },

    onError: (err) => {
      console.log(err);
    },
  });
};

/////////////////////////////////////////////////
// VERIFY OTP
/////////////////////////////////////////////////

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyOtpService,

    onSuccess: (data) => {
      queryClient.setQueryData(["verifyOtp"], data);

      console.log("OTP Verified");
    },

    onError: (err) => {
      console.log(err);
    },
  });
};


export const adiminCreateOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRequestOtp,

    onSuccess: (data) => {
      queryClient.setQueryData(["adiminCreateOtp"], data);
    },

    onError: (err) => {
      console.log(err); 
    }
  });
}


export const adminCreateVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVerifyOtpService,

    onSuccess: (data) => {
      queryClient.setQueryData(["adminCreateVerifyOtp"], data);
    },

    onError: (err) => {
      console.log(err); 
    }
  });
    }


export const adminCreateUserLocationDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserLocationDetails,

    onSuccess: (data) => {
      queryClient.setQueryData(["createUserLocationDetails"], data);
    },

    onError: (err) => {
      console.log(err); 
    }
  });
}