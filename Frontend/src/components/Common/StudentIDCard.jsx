import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";


const StudentIDCard = ({ studentData }) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Student ID Card</CardTitle>
            <CardDescription>Valid through 2026</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          {/* Student Info */}
          <div className="col-span-2 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {`${studentData.personal.firstName} ${studentData.personal.lastName}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">College</p>
              <p className="font-medium">{studentData.academic.collegeName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Course</p>
              <p className="font-medium">{studentData.academic.course}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center">
            <QRCodeCanvas
              value={JSON.stringify({
                id: studentData._id,
                name: `${studentData.personal.firstName} ${studentData.personal.lastName}`,
                course: studentData.academic.course,
                college: studentData.academic.collegeName,
              })}
              size={100}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
            <p className="text-xs text-muted-foreground mt-2">Scan for Details</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-blue-100/50 py-3">
        <div className="flex justify-between items-center w-full text-sm">
          <span className="text-muted-foreground">
            Admission: {studentData.academic.admissionYear}
          </span>
          <span className="text-xs text-green-800 px-4 py-1 border border-green-500 bg-green-50 rounded-sm">Active</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StudentIDCard;
