import React from 'react';

const ProfileModal = ({ show, user, onClose, onUpdate, onLogout }) => {
  const [form, setForm] = React.useState({
    name: user?.name || '',
    address: user?.address || '',
    phone: user?.phone || ''
  });

  React.useEffect(() => {
    setForm({
      name: user?.name || '',
      address: user?.address || '',
      phone: user?.phone || ''
    });
  }, [user]);

  if (!show) return null;
  return (
    <div className="modal d-block show" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">User Profile</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form className="p-3" onSubmit={e => { e.preventDefault(); onUpdate(form); }}>
              <div className="mb-3">
                <label className="form-label fw-bold">Name:</label>
                <input type="text" className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Email:</label>
                <input type="email" className="form-control" value={user?.email || ''} readOnly disabled />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Role:</label>
                <input type="text" className="form-control" value={user?.role || 'user'} readOnly disabled />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Address:</label>
                <input type="text" className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Phone:</label>
                <input type="tel" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-success btn-lg">Update Profile</button>
                <button type="button" onClick={onLogout} className="btn btn-danger btn-lg">Logout</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
