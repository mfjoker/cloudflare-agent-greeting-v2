import ReactDOM from "react-dom";
import AdminReportTable from "../admin-report-table/admin-report-table";

type PropTypes = {
  setShow: (show: boolean) => void;
};

const AdminReportModal = ({ setShow }: PropTypes) => {
  function closeReport(): void {
    setShow(false);
  }

  return ReactDOM.createPortal(
    <>
      <div className="font-roboto fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div className="flex flex-col w-[1000px] bg-neutral-200 p-4 rounded-lg">
          <h1 className="text-center">Agent Report</h1>
          <div className="flex flex-row justify-center">
            <AdminReportTable />
          </div>
          <div className="flex flex-row justify-center mt-4">
            <button
              className="bg-blue-500 text-white p-2 rounded-lg"
              onClick={closeReport}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.getElementById("agentReportPortal") as Element | DocumentFragment
  );
};

export default AdminReportModal;
