export default function AboutPage() {
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-6">About KALAVPP</h1>
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-600">
            KALAVPP is your marketplace for unique art, creative services, and custom commissions 
            from talented artists worldwide. We connect creators with customers who appreciate 
            their work.
          </p>
        </div>
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Original artwork and digital downloads</li>
            <li>Custom commission services</li>
            <li>Creative workshops and courses</li>
            <li>Direct connection with artists</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
