import { Container, Row, Form, Button, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const Verify = () => {

  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const { token } = router.query;

    if (!token) {
      router.push("/manage/profile");
      return;
    }

    const verifyToken = async () => {

      try {
        const res = await fetch("/api/manage/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setVerifying(false);
          setTimeout(() => router.push("/manage/profile"), 2000);
        } else {
          setVerifying(false);
          setError(data.message);
        }
      } catch (error) {

        setVerifying(false);
        setError("Verification failed. Please try again.");
      }

     };

    verifyToken();
    
  }, [router.query]);

  return (
    <Container>
      <Row className="justify-content-center align-items-center authentication authentication-basic h-100">
        <Col md={6} className="mx-auto">
          <div className="card-sigin shadow-lg border border-primary">
            <div className="main-card-signin d-md-flex">
              <div className="ms-3 wd-100p">
                <motion.div
                  className="d-flex justify-content-center align-items-center mb-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5 }}
                >
                  <img src="/images/main-logo.png" alt="Logo" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1.5 }}
                >
                  <motion.div className="text-center p-5">
                    {verifying ? (
                      <>
                        <h2>Verifying...</h2>
                        <p>Please wait while we verify your details.</p>
                      </>
                    ) : error ? (
                      <>
                        <h2 className="text-danger">Verification Failed</h2>
                        <p>{error}</p>
                        <Button
                          onClick={() => router.push("/manage/profile")}
                          className="mt-3"
                        >
                          Back to Profile
                        </Button>
                      </>
                    ) : (
                      <>
                        <h2 className="text-success">
                          Verification Successful
                        </h2>
                        <p>Redirecting to profile...</p>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

Verify.layout = "ManageLayout";

export default Verify;
