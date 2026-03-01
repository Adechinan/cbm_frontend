/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import { useState } from "react";
import { Modal, Button, Form, Card } from "react-bootstrap";

const SearchBar = () => {

  const [show, setShow] = useState(false);

  return (
    <>
      <div className="topbar-search text-muted d-none d-xl-flex gap-2 align-items-center" onClick={() => setShow(!show)} >
        <IconifyIcon icon='tabler:search' className="fs-18" />
        <span className="me-2">Search something..</span>
        <span className="ms-auto fw-medium">⌘K</span>
      </div>

      <Modal show={show} onHide={() => setShow(!show)}  backdrop>
        <Modal.Body className="m-0 p-0">

          <Card className="mb-0">
            <Card.Body className="px-3 py-2 d-flex flex-row align-items-center" id="top-search">
              <IconifyIcon icon='tabler:search' className="fs-18" />
              <Form.Control
                type="search"
                className="border-0"
                id="search-modal-input"
                placeholder="Search for actions, people,"
              />
              <Button variant="link" className="p-0" onClick={() => setShow(!show)} aria-label="Close">
                [esc]
              </Button>
            </Card.Body>
          </Card>

        </Modal.Body>
      </Modal>
    </>
  )
}

export default SearchBar