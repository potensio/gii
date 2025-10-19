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
  confirmationLink: string;
};

export const EmailConfirmation = ({
  name = "Teman",
  confirmationLink,
}: Props) => {
  return (
    <Html lang="id">
      <Head />
      <Preview>Konfirmasi email kamu di GII</Preview>
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
              fontSize: "14px",
              color: "#333",
              marginBottom: "16px",
            }}
          >
            Terima kasih sudah mendaftar di <strong>GII</strong>. Silakan klik
            tombol di bawah untuk mengonfirmasi email kamu.
          </Text>

          <Button
            href={confirmationLink}
            style={{
              backgroundColor: "#101010",
              color: "#fff",
              padding: "12px 12px",
              borderRadius: "0px",
              fontWeight: 500,
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Konfirmasi Email
          </Button>

          <Text
            style={{
              fontSize: "12px",
              color: "#ababab",
              lineHeight: "1.5",
            }}
          >
            Kalau tombolnya tidak berfungsi, buka link ini di browser kamu:
          </Text>

          <Text
            style={{
              fontSize: "12px",
              color: "#ababab",
              lineHeight: "1.5",
              marginBottom: "32px",
            }}
          >
            <a
              href={confirmationLink}
              style={{ color: "#0000FF", textDecoration: "underline" }}
            >
              {confirmationLink}
            </a>
          </Text>

          <Text style={{ fontSize: "10px", color: "#898989", lineHeight: "2" }}>
            Global Inovasi Industri
            <br />
            Belanja elektronik dengan GII, asli & bergaransi!
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default EmailConfirmation;
