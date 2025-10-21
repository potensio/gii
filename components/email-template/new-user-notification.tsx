import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

type Props = {
  name?: string;
  email: string;
  createdBy?: string;
  loginLink: string;
};

export const NewUserNotification = ({
  name = "Teman",
  email,
  createdBy = "Administrator",
  loginLink,
}: Props) => {
  return (
    <Html lang="id">
      <Head />
      <Preview>Akun baru telah dibuat untuk kamu di GII</Preview>
      <Body
        style={{
          backgroundColor: "#f7f7f7",
          fontFamily:
            "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
          padding: "20px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "0px",
            padding: "24px",
            maxWidth: "480px",
          }}
        >
          <Text
            style={{
              fontSize: "20px",
              fontWeight: 500,
              marginBottom: "16px",
              letterSpacing: "0px",
              color: "#333",
            }}
          >
            Hai, {name}! 👋
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              marginBottom: "16px",
              color: "#555",
            }}
          >
            Kami ingin memberitahu kamu bahwa akun baru telah dibuat untuk kamu di platform GII.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              marginBottom: "16px",
              color: "#555",
            }}
          >
            <strong>Detail akun kamu:</strong>
          </Text>

          <Container
            style={{
              backgroundColor: "#f8f9fa",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                margin: "4px 0",
                color: "#666",
              }}
            >
              <strong>Email:</strong> {email}
            </Text>
            <Text
              style={{
                fontSize: "14px",
                margin: "4px 0",
                color: "#666",
              }}
            >
              <strong>Dibuat oleh:</strong> {createdBy}
            </Text>
          </Container>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              marginBottom: "24px",
              color: "#555",
            }}
          >
            Untuk mengakses akun kamu, silakan klik tombol di bawah ini untuk melakukan verifikasi email dan mengatur kata sandi:
          </Text>

          <Button
            href={loginLink}
            style={{
              backgroundColor: "#000000",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: 500,
              display: "inline-block",
              marginBottom: "24px",
            }}
          >
            Verifikasi & Akses Akun
          </Button>

          <Text
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              color: "#888",
              marginBottom: "16px",
            }}
          >
            Jika kamu tidak mengharapkan email ini atau merasa ada kesalahan, silakan hubungi administrator kami.
          </Text>

          <Text
            style={{
              fontSize: "12px",
              lineHeight: "16px",
              color: "#aaa",
              marginTop: "32px",
            }}
          >
            Email ini dikirim secara otomatis, mohon jangan membalas email ini.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default NewUserNotification;