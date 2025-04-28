import { toast } from "react-toastify";

export const useAlert = () => {
  const success = (msg) =>
    toast.success(msg, {
      theme: "colored", // puedes quitar theme o poner "light"/"dark"
      icon: "✅",
    });

  const error = (msg) =>
    toast.error(msg, {
      theme: "colored",
      icon: "❌",
    });

  const info = (msg) =>
    toast.info(msg, {
      theme: "colored",
      icon: "ℹ️",
    });

  return { success, error, info };
};
