"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  EditIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  FileTextIcon,
  UploadIcon
} from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  joinDate: string;
  dateOfBirth: string;
  status: 'active' | 'inactive';
  notes: string;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activityNotes, setActivityNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) throw new Error('Failed to load customer');
        const data = await res.json();
        setCustomer({
          ...data.customer,
          joinDate: data.customer.createdAt
        });
        setDocuments(data.documents || []);
        setActivityNotes(data.activityNotes || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const addNote = () => {
    if (newNote.trim()) {
      // In a real app, this would be an API call
      setNewNote('');
    }
  };

  if (loading) {
    return <div className="p-6">Loading customer...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }
  if (!customer) {
    return <div className="p-6">Customer not found.</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/customers"
            className="flex items-center text-neutral-600 hover:text-neutral-900 font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Customers
          </Link>
        </div>
        <Link 
          href={`/customers/${id}/edit`}
          className="slds-button slds-button-brand flex items-center space-x-2"
        >
          <EditIcon className="h-4 w-4" />
          <span>Edit Customer</span>
        </Link>
      </div>

      {/* Customer Info Card */}
      <div className="slds-card">
        <div className="p-6">
          <div className="flex items-start space-x-6">
            <div className="h-4 w-4 rounded-full bg-green-400 mt-2"></div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neutral-900">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-neutral-600 font-semibold text-lg">{customer.id}</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <MailIcon className="h-5 w-5 text-neutral-500" />
                  <span className="text-sm text-neutral-700">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-neutral-500" />
                  <span className="text-sm text-neutral-700">{customer.mobile}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-neutral-500" />
                  <span className="text-sm text-neutral-700">Joined {customer.joinDate?.split('T')[0]}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Details */}
        <div className="slds-card">
          <div className="slds-card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Personal Details</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Date of Birth</label>
              <p className="text-sm text-neutral-900 mt-1">{customer.dateOfBirth}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Address</label>
              <p className="text-sm text-neutral-900 mt-1">
                {customer.address}<br />
                {customer.city}, {customer.state} {customer.zipCode}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Notes</label>
              <p className="text-sm text-neutral-900 mt-1">{customer.notes}</p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="slds-card">
          <div className="slds-card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Documents</h3>
            <button className="text-salesforce-600 hover:text-salesforce-700">
              <UploadIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded hover:bg-neutral-50">
                <div className="flex items-center space-x-3">
                  <FileTextIcon className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{doc.name}</p>
                    <p className="text-xs text-neutral-500">{doc.size} • {doc.uploadDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Notes */}
        <div className="slds-card">
          <div className="slds-card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Activity Notes</h3>
          </div>
          <div className="p-6">
            {/* Add New Note */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="slds-input"
                rows={2}
              />
              <button
                onClick={addNote}
                className="mt-2 slds-button slds-button-brand text-sm"
              >
                Add Note
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activityNotes.map((note) => (
                <div key={note.id} className="p-3 border border-neutral-200 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-800">
                      {note.type}
                    </span>
                    <span className="text-xs text-neutral-500">{note.date} at {note.time}</span>
                  </div>
                  <p className="text-sm text-neutral-900">{note.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
